import { input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { fetch } from "undici";
import path from "node:path";
import log from "../utils/logger.js";
import { getVideoConfig } from "../config.js";
import { transform as muxTransform } from "../providers/mux/transformer.js";
const PLAYBACK_ID_REGEX = /^[a-zA-Z0-9]{22,}$/;
function sanitizeFilename(title) {
  return title.replace(/[^a-zA-Z0-9\s\-_]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}
function sanitizeImportName(filename) {
  const nameWithoutExt = filename.replace(/\.mp4$/, "");
  return nameWithoutExt.replace(/[^a-zA-Z0-9\s\-_]/g, "").replace(/[-\s]+(.)/g, (_, char) => char.toUpperCase()).replace(/^[^a-zA-Z_$]/, "_").replace(/[^a-zA-Z0-9_$]/g, "_");
}
async function fetchMuxMetadata(playbackId) {
  try {
    const response = await fetch(`https://stream.mux.com/${playbackId}/metadata.json`);
    if (!response.ok) {
      return null;
    }
    const metadata = await response.json();
    const title = metadata?.[0]?.titles?.[0]?.title;
    return title ? sanitizeFilename(title) : null;
  } catch (error) {
    return null;
  }
}
const command = "adopt <playbackId>";
const desc = "Create a local asset metadata file for an existing Mux asset using its playback ID.";
function builder(yargs) {
  return yargs.positional("playbackId", {
    describe: "The Mux playback ID of the asset to adopt",
    type: "string",
    demandOption: true
  }).options({
    dir: {
      alias: "d",
      describe: "The directory to save the asset metadata file.",
      type: "string",
      default: "videos"
    },
    name: {
      alias: "n",
      describe: "Custom name for the asset file (without extension).",
      type: "string"
    },
    "thumbnail-time": {
      alias: "t",
      describe: "Thumbnail time in seconds for the poster image.",
      type: "number"
    },
    interactive: {
      alias: "i",
      describe: "Run in interactive mode to configure all options.",
      type: "boolean",
      default: true
    }
  });
}
async function handler(argv) {
  const playbackId = argv.playbackId;
  const dir = argv.dir;
  const interactive = argv.interactive;
  if (!PLAYBACK_ID_REGEX.test(playbackId)) {
    log.error("Invalid playback ID format. Mux playback IDs should be alphanumeric and at least 22 characters long.");
    return;
  }
  log.info(
    `${chalk.magenta.bold("next-video adopt")}: Creating asset metadata for playback ID: ${chalk.cyan(playbackId)}`
  );
  log.space();
  log.info("Fetching asset metadata from Mux...");
  const muxTitle = await fetchMuxMetadata(playbackId);
  if (muxTitle) {
    log.info(`Found title: ${chalk.cyan(muxTitle)} (sanitized for filename)`);
  } else {
    log.info("No metadata found or unable to fetch from Mux");
  }
  log.space();
  try {
    const videoConfig = await getVideoConfig();
    if (videoConfig.provider !== "mux") {
      log.warning(
        `Current provider is "${videoConfig.provider}". The adopt command is currently only compatible with Mux assets.`
      );
      if (interactive) {
        const proceed = await confirm({
          message: "Do you want to proceed anyway?",
          default: false
        });
        if (!proceed) {
          log.info("Adoption cancelled.");
          return;
        }
      }
    }
    let assetName = argv.name;
    let thumbnailTime = argv["thumbnail-time"];
    if (interactive) {
      if (!assetName) {
        const defaultName = muxTitle || `adopted-${playbackId.slice(0, 8)}`;
        assetName = await input({
          message: "Asset name (filename without extension):",
          default: defaultName,
          validate: (input2) => {
            if (!input2.trim()) return "Asset name is required";
            if (input2.includes("/") || input2.includes("\\")) return "Asset name should not contain path separators";
            return true;
          }
        });
      }
      const configureThumbnail = await confirm({
        message: "Do you want to configure a custom thumbnail time?",
        default: false
      });
      if (configureThumbnail && thumbnailTime === void 0) {
        const thumbnailInput = await input({
          message: "Thumbnail time in seconds:",
          default: "0",
          validate: (input2) => {
            const num = parseFloat(input2);
            if (isNaN(num) || num < 0) return "Please enter a valid number >= 0";
            return true;
          }
        });
        thumbnailTime = parseFloat(thumbnailInput);
      }
    } else {
      assetName = assetName || muxTitle || `adopted-${playbackId.slice(0, 8)}`;
    }
    const originalPath = `${dir}/${assetName}.mp4`;
    const now = Date.now();
    const baseAsset = {
      status: "ready",
      originalFilePath: originalPath,
      provider: "mux",
      providerMetadata: {
        mux: {
          playbackId
        }
      },
      createdAt: now,
      updatedAt: now
    };
    if (thumbnailTime !== void 0) {
      baseAsset.providerMetadata.mux.thumbnailTime = thumbnailTime;
    }
    const transformedAsset = muxTransform(baseAsset, { thumbnailTime });
    try {
      const { createThumbHash } = await import("../providers/mux/provider.js");
      const blurDataURL = await createThumbHash(
        `https://image.mux.com/${playbackId}/thumbnail.webp?width=16&height=16`
      );
      transformedAsset.blurDataURL = blurDataURL;
    } catch (error) {
      log.warning("Could not generate blur data URL for thumbnail");
    }
    const assetFilePath = path.join(dir, `${assetName}.mp4`);
    const assetConfigPath = `${assetFilePath}.json`;
    await videoConfig.saveAsset(assetConfigPath, transformedAsset);
    log.success(`Asset metadata created: ${chalk.cyan(assetConfigPath)}`);
    log.space();
    log.info("Asset details:");
    log.space(chalk.gray(">"), log.label("Playback ID:"), playbackId);
    log.space(chalk.gray(">"), log.label("Original Path:"), originalPath);
    log.space(chalk.gray(">"), log.label("Video Source:"), transformedAsset.sources?.[0]?.src || "N/A");
    log.space(chalk.gray(">"), log.label("Poster:"), transformedAsset.poster || "N/A");
    if (thumbnailTime !== void 0) {
      log.space(chalk.gray(">"), log.label("Thumbnail Time:"), `${thumbnailTime}s`);
    }
    log.space();
    log.info(`You can now import this asset in your Next.js application:`);
    log.space();
    const importName = sanitizeImportName(assetName);
    log.space(`${chalk.magenta("import")} Video ${chalk.magenta("from")} ${chalk.cyan("'next-video'")};`);
    log.space(
      `${chalk.magenta("import")} ${importName} ${chalk.magenta("from")} ${chalk.cyan(`'/${assetFilePath}'`)};`
    );
    log.space();
    log.space(`${chalk.magenta("export default function")} Page() {`);
    log.space(
      `  ${chalk.magenta("return")} ${chalk.cyan("<")}Video ${chalk.cyan("src=")}{${importName}} ${chalk.cyan("/>")};`
    );
    log.space(`}`);
    log.space();
  } catch (error) {
    log.error("Failed to adopt asset:", error.message);
    if (error.code === "ENOENT" && error.path?.includes(dir)) {
      log.info(
        `Directory ${chalk.bold(dir)} does not exist. You may need to run ${chalk.bold.magenta("next-video init")} first.`
      );
    }
  }
}
export {
  builder,
  command,
  desc,
  handler
};
