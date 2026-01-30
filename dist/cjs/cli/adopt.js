"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var adopt_exports = {};
__export(adopt_exports, {
  builder: () => builder,
  command: () => command,
  desc: () => desc,
  handler: () => handler
});
module.exports = __toCommonJS(adopt_exports);
var import_prompts = require("@inquirer/prompts");
var import_chalk = __toESM(require("chalk"), 1);
var import_undici = require("undici");
var import_node_path = __toESM(require("node:path"), 1);
var import_logger = __toESM(require("../utils/logger.js"), 1);
var import_config = require("../config.js");
var import_transformer = require("../providers/mux/transformer.js");
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
    const response = await (0, import_undici.fetch)(`https://stream.mux.com/${playbackId}/metadata.json`);
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
    import_logger.default.error("Invalid playback ID format. Mux playback IDs should be alphanumeric and at least 22 characters long.");
    return;
  }
  import_logger.default.info(
    `${import_chalk.default.magenta.bold("next-video adopt")}: Creating asset metadata for playback ID: ${import_chalk.default.cyan(playbackId)}`
  );
  import_logger.default.space();
  import_logger.default.info("Fetching asset metadata from Mux...");
  const muxTitle = await fetchMuxMetadata(playbackId);
  if (muxTitle) {
    import_logger.default.info(`Found title: ${import_chalk.default.cyan(muxTitle)} (sanitized for filename)`);
  } else {
    import_logger.default.info("No metadata found or unable to fetch from Mux");
  }
  import_logger.default.space();
  try {
    const videoConfig = await (0, import_config.getVideoConfig)();
    if (videoConfig.provider !== "mux") {
      import_logger.default.warning(
        `Current provider is "${videoConfig.provider}". The adopt command is currently only compatible with Mux assets.`
      );
      if (interactive) {
        const proceed = await (0, import_prompts.confirm)({
          message: "Do you want to proceed anyway?",
          default: false
        });
        if (!proceed) {
          import_logger.default.info("Adoption cancelled.");
          return;
        }
      }
    }
    let assetName = argv.name;
    let thumbnailTime = argv["thumbnail-time"];
    if (interactive) {
      if (!assetName) {
        const defaultName = muxTitle || `adopted-${playbackId.slice(0, 8)}`;
        assetName = await (0, import_prompts.input)({
          message: "Asset name (filename without extension):",
          default: defaultName,
          validate: (input2) => {
            if (!input2.trim()) return "Asset name is required";
            if (input2.includes("/") || input2.includes("\\")) return "Asset name should not contain path separators";
            return true;
          }
        });
      }
      const configureThumbnail = await (0, import_prompts.confirm)({
        message: "Do you want to configure a custom thumbnail time?",
        default: false
      });
      if (configureThumbnail && thumbnailTime === void 0) {
        const thumbnailInput = await (0, import_prompts.input)({
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
    const transformedAsset = (0, import_transformer.transform)(baseAsset, { thumbnailTime });
    try {
      const { createThumbHash } = await import("../providers/mux/provider.js");
      const blurDataURL = await createThumbHash(
        `https://image.mux.com/${playbackId}/thumbnail.webp?width=16&height=16`
      );
      transformedAsset.blurDataURL = blurDataURL;
    } catch (error) {
      import_logger.default.warning("Could not generate blur data URL for thumbnail");
    }
    const assetFilePath = import_node_path.default.join(dir, `${assetName}.mp4`);
    const assetConfigPath = `${assetFilePath}.json`;
    await videoConfig.saveAsset(assetConfigPath, transformedAsset);
    import_logger.default.success(`Asset metadata created: ${import_chalk.default.cyan(assetConfigPath)}`);
    import_logger.default.space();
    import_logger.default.info("Asset details:");
    import_logger.default.space(import_chalk.default.gray(">"), import_logger.default.label("Playback ID:"), playbackId);
    import_logger.default.space(import_chalk.default.gray(">"), import_logger.default.label("Original Path:"), originalPath);
    import_logger.default.space(import_chalk.default.gray(">"), import_logger.default.label("Video Source:"), transformedAsset.sources?.[0]?.src || "N/A");
    import_logger.default.space(import_chalk.default.gray(">"), import_logger.default.label("Poster:"), transformedAsset.poster || "N/A");
    if (thumbnailTime !== void 0) {
      import_logger.default.space(import_chalk.default.gray(">"), import_logger.default.label("Thumbnail Time:"), `${thumbnailTime}s`);
    }
    import_logger.default.space();
    import_logger.default.info(`You can now import this asset in your Next.js application:`);
    import_logger.default.space();
    const importName = sanitizeImportName(assetName);
    import_logger.default.space(`${import_chalk.default.magenta("import")} Video ${import_chalk.default.magenta("from")} ${import_chalk.default.cyan("'next-video'")};`);
    import_logger.default.space(
      `${import_chalk.default.magenta("import")} ${importName} ${import_chalk.default.magenta("from")} ${import_chalk.default.cyan(`'/${assetFilePath}'`)};`
    );
    import_logger.default.space();
    import_logger.default.space(`${import_chalk.default.magenta("export default function")} Page() {`);
    import_logger.default.space(
      `  ${import_chalk.default.magenta("return")} ${import_chalk.default.cyan("<")}Video ${import_chalk.default.cyan("src=")}{${importName}} ${import_chalk.default.cyan("/>")};`
    );
    import_logger.default.space(`}`);
    import_logger.default.space();
  } catch (error) {
    import_logger.default.error("Failed to adopt asset:", error.message);
    if (error.code === "ENOENT" && error.path?.includes(dir)) {
      import_logger.default.info(
        `Directory ${import_chalk.default.bold(dir)} does not exist. You may need to run ${import_chalk.default.bold.magenta("next-video init")} first.`
      );
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  builder,
  command,
  desc,
  handler
});
