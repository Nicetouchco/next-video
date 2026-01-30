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
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
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
var config_exports = {};
__export(config_exports, {
  getVideoConfig: () => getVideoConfig,
  setVideoConfig: () => setVideoConfig,
  videoConfigDefault: () => videoConfigDefault
});
module.exports = __toCommonJS(config_exports);
var import_node_path = __toESM(require("node:path"), 1);
var import_promises = require("node:fs/promises");
var import_node_process = require("node:process");
const videoConfigDefault = {
  folder: "videos",
  path: "/api/video",
  provider: "mux",
  providerConfig: {},
  loadAsset: async function(assetPath) {
    const file = await (0, import_promises.readFile)(assetPath);
    const asset = JSON.parse(file.toString());
    return asset;
  },
  saveAsset: async function(assetPath, asset) {
    try {
      await (0, import_promises.mkdir)(import_node_path.default.dirname(assetPath), { recursive: true });
      await (0, import_promises.writeFile)(assetPath, JSON.stringify(asset), {
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
    await (0, import_promises.writeFile)(assetPath, JSON.stringify(asset));
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
      await loadNextConfig("phase-development-server", (0, import_node_process.cwd)());
    } catch (err) {
      console.error(err);
    }
  }
  return globalThis.__nextVideo.configComplete;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getVideoConfig,
  setVideoConfig,
  videoConfigDefault
});
