import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { cwd } from "node:process";
const videoConfigDefault = {
  folder: "videos",
  path: "/api/video",
  provider: "mux",
  providerConfig: {},
  loadAsset: async function(assetPath) {
    const file = await readFile(assetPath);
    const asset = JSON.parse(file.toString());
    return asset;
  },
  saveAsset: async function(assetPath, asset) {
    try {
      await mkdir(path.dirname(assetPath), { recursive: true });
      await writeFile(assetPath, JSON.stringify(asset), {
        flag: "wx"
      });
    } catch (err) {
      if (err.code === "EEXIST") {
        return;
      }
      throw err;
    }
  },
  updateAsset: async function(assetPath, asset) {
    await writeFile(assetPath, JSON.stringify(asset));
  }
};
globalThis.__nextVideo = {
  configComplete: videoConfigDefault,
  configIsDefined: false
};
function setVideoConfig(videoConfig) {
  globalThis.__nextVideo.configIsDefined = true;
  globalThis.__nextVideo.configComplete = { ...videoConfigDefault, ...videoConfig };
  return globalThis.__nextVideo.configComplete;
}
async function getVideoConfig() {
  if (!globalThis.__nextVideo.configIsDefined) {
    try {
      const nextConfigModule = (await import(
        /* webpackIgnore: true */
        "next/dist/server/config.js"
      )).default;
      const loadNextConfig = nextConfigModule.default ?? nextConfigModule;
      await loadNextConfig("phase-development-server", cwd());
    } catch (err) {
      console.error(err);
    }
  }
  return globalThis.__nextVideo.configComplete;
}
export {
  getVideoConfig,
  setVideoConfig,
  videoConfigDefault
};
