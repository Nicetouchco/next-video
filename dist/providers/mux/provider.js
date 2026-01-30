import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import chalk from "chalk";
import Mux from "@mux/mux-node";
import { fetch as uFetch } from "undici";
import { minimatch } from "minimatch";
import { updateAsset } from "../../assets.js";
import { getVideoConfig } from "../../config.js";
import log from "../../utils/logger.js";
import { sleep } from "../../utils/utils.js";
import { Queue } from "../../utils/queue.js";
function validateNewAssetSettings(newAssetSettings) {
  const errors = [];
  if (!newAssetSettings || typeof newAssetSettings !== "object") {
    errors.push("newAssetSettings must be an object");
    return { valid: false, errors };
  }
  if (newAssetSettings.maxResolutionTier !== void 0) {
    const validResolutions = ["1080p", "1440p", "2160p"];
    if (!validResolutions.includes(newAssetSettings.maxResolutionTier)) {
      errors.push(`maxResolutionTier must be one of: ${validResolutions.join(", ")}`);
    }
  }
  if (newAssetSettings.videoQuality !== void 0) {
    const validQualities = ["basic", "plus", "premium"];
    if (!validQualities.includes(newAssetSettings.videoQuality)) {
      errors.push(`videoQuality must be one of: ${validQualities.join(", ")}`);
    }
  }
  const validProperties = ["maxResolutionTier", "videoQuality"];
  const unknownProperties = Object.keys(newAssetSettings).filter((key) => !validProperties.includes(key));
  if (unknownProperties.length > 0) {
    errors.push(`Unknown properties: ${unknownProperties.join(", ")}. Valid properties: ${validProperties.join(", ")}`);
  }
  return { valid: errors.length === 0, errors };
}
function getNewAssetSettings(filePath, muxConfig) {
  try {
    if (!filePath) {
      return void 0;
    }
    const normalizedFilePath = filePath.replace(/\\/g, "/");
    if (muxConfig?.newAssetSettings?.[filePath] || muxConfig?.newAssetSettings?.[normalizedFilePath]) {
      const newAssetSettings = muxConfig.newAssetSettings[filePath] || muxConfig.newAssetSettings[normalizedFilePath];
      log.info(log.label("Asset settings:"), "Using exact path match");
      return newAssetSettings;
    }
    if (muxConfig?.newAssetSettings) {
      for (const [pattern, newAssetSettings] of Object.entries(muxConfig.newAssetSettings)) {
        if (minimatch(normalizedFilePath, pattern)) {
          log.info(log.label("Asset settings:"), "Using pattern match");
          return newAssetSettings;
        }
      }
    }
    return void 0;
  } catch (e) {
    log.error("Error retrieving asset settings for file:", filePath);
    return void 0;
  }
}
let mux;
let queue;
function initMux() {
  mux ?? (mux = new Mux());
  queue ?? (queue = new Queue());
}
async function pollForAssetReady(filePath, asset) {
  const providerMetadata = asset.providerMetadata?.mux;
  if (!providerMetadata?.assetId) {
    log.error("No assetId provided for asset.");
    console.error(asset);
    return;
  }
  initMux();
  const assetId = providerMetadata?.assetId;
  const muxAsset = await mux.video.assets.retrieve(assetId);
  const playbackId = muxAsset.playback_ids?.[0].id;
  let updatedAsset = asset;
  if (providerMetadata?.playbackId !== playbackId) {
    updatedAsset = await updateAsset(filePath, {
      providerMetadata: {
        mux: {
          playbackId
        }
      }
    });
  }
  if (muxAsset.status === "errored") {
    log.error(log.label("Asset errored:"), filePath);
    log.space(chalk.gray(">"), log.label("Mux Asset ID:"), assetId);
    return updateAsset(filePath, {
      status: "error",
      error: muxAsset.errors
    });
  }
  if (muxAsset.status === "ready") {
    let blurDataURL;
    try {
      blurDataURL = await createThumbHash(`https://image.mux.com/${playbackId}/thumbnail.webp?width=16&height=16`);
    } catch (e) {
      log.error("Error creating a thumbnail hash.");
    }
    log.success(log.label("Asset is ready:"), filePath);
    log.space(chalk.gray(">"), log.label("Playback ID:"), playbackId);
    return updateAsset(filePath, {
      status: "ready",
      blurDataURL,
      providerMetadata: {
        mux: {
          playbackId
        }
      }
    });
  } else {
    await sleep(1e3);
    return pollForAssetReady(filePath, updatedAsset);
  }
}
async function pollForUploadAsset(filePath, asset) {
  const providerMetadata = asset.providerMetadata?.mux;
  if (!providerMetadata?.uploadId) {
    log.error("No uploadId provided for asset.");
    console.error(asset);
    return;
  }
  initMux();
  const uploadId = providerMetadata?.uploadId;
  const muxUpload = await mux.video.uploads.retrieve(uploadId);
  if (muxUpload.asset_id) {
    log.info(log.label("Asset is processing:"), filePath);
    log.space(chalk.gray(">"), log.label("Mux Asset ID:"), muxUpload.asset_id);
    const processingAsset = await updateAsset(filePath, {
      status: "processing",
      providerMetadata: {
        mux: {
          assetId: muxUpload.asset_id
        }
      }
    });
    return pollForAssetReady(filePath, processingAsset);
  } else {
    await sleep(1e3);
    return pollForUploadAsset(filePath, asset);
  }
}
async function createUploadURL(filePath) {
  try {
    const { providerConfig } = await getVideoConfig();
    const muxConfig = providerConfig.mux;
    const newAssetSettings = getNewAssetSettings(filePath, muxConfig);
    const upload = await mux.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policy: ["public"],
        video_quality: newAssetSettings?.videoQuality || muxConfig?.videoQuality,
        max_resolution_tier: newAssetSettings?.maxResolutionTier
      }
    });
    return upload;
  } catch (e) {
    if (e instanceof Error && "status" in e && e.status === 401) {
      log.error("Unauthorized request. Check that your MUX_TOKEN_ID and MUX_TOKEN_SECRET credentials are valid.");
    } else {
      log.error("Error creating a Mux Direct Upload");
      console.error(e);
    }
    return void 0;
  }
}
async function uploadLocalFile(asset) {
  const filePath = asset.originalFilePath;
  if (!filePath) {
    log.error("No filePath provided for asset.");
    console.error(asset);
    return;
  }
  initMux();
  if (asset.status === "ready") {
    return;
  } else if (asset.status === "processing") {
    log.info(log.label("Asset is already processing. Polling for completion:"), filePath);
    return pollForAssetReady(filePath, asset);
  } else if (asset.status === "uploading") {
    log.info(log.label("Resuming upload:"), filePath);
  }
  if (filePath && /^https?:\/\//.test(filePath)) {
    return uploadRequestedFile(asset);
  }
  const upload = await queue.enqueue(() => createUploadURL(filePath));
  if (!upload) {
    return;
  }
  await updateAsset(filePath, {
    status: "uploading",
    providerMetadata: {
      mux: {
        uploadId: upload.id
        // more typecasting while we use the beta mux sdk
      }
    }
  });
  const fileStats = await fs.stat(filePath);
  const stream = createReadStream(filePath);
  log.info(log.label("Uploading file:"), `${filePath} (${fileStats.size} bytes)`);
  try {
    await uFetch(upload.url, {
      method: "PUT",
      // @ts-ignore
      body: stream,
      duplex: "half"
    });
    stream.close();
  } catch (e) {
    log.error("Error uploading to the Mux upload URL");
    console.error(e);
    return;
  }
  log.success(log.label("File uploaded:"), `${filePath} (${fileStats.size} bytes)`);
  const processingAsset = await updateAsset(filePath, {
    status: "processing"
  });
  return pollForUploadAsset(filePath, processingAsset);
}
async function uploadRequestedFile(asset) {
  const filePath = asset.originalFilePath;
  if (!filePath) {
    log.error("No URL provided for asset.");
    console.error(asset);
    return;
  }
  initMux();
  if (asset.status === "ready") {
    return;
  } else if (asset.status === "processing") {
    log.info(log.label("Asset is already processing. Polling for completion:"), filePath);
    return pollForAssetReady(filePath, asset);
  }
  const { providerConfig } = await getVideoConfig();
  const muxConfig = providerConfig.mux;
  const newAssetSettings = getNewAssetSettings(filePath, muxConfig);
  const assetObj = await mux.video.assets.create({
    input: [
      {
        url: filePath
      }
    ],
    playback_policy: ["public"],
    video_quality: newAssetSettings?.videoQuality || muxConfig?.videoQuality,
    max_resolution_tier: newAssetSettings?.maxResolutionTier
  });
  log.info(log.label("Asset is processing:"), filePath);
  log.space(chalk.gray(">"), log.label("Mux Asset ID:"), assetObj.id);
  const processingAsset = await updateAsset(filePath, {
    status: "processing",
    providerMetadata: {
      mux: {
        assetId: assetObj.id
      }
    }
  });
  return pollForAssetReady(filePath, processingAsset);
}
async function createThumbHash(imgUrl) {
  const response = await uFetch(imgUrl);
  const buffer = await response.arrayBuffer();
  const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return `data:image/webp;base64,${base64String}`;
}
export {
  createThumbHash,
  uploadLocalFile,
  uploadRequestedFile,
  validateNewAssetSettings
};
