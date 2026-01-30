"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var video_json_loader_exports = {};
__export(video_json_loader_exports, {
  createThumbHash: () => createThumbHash,
  default: () => loader
});
module.exports = __toCommonJS(video_json_loader_exports);
var import_undici = require("undici");
async function loader(source) {
  const params = new URLSearchParams(this.resourceQuery);
  const thumbnailTime = params.get("thumbnailTime");
  let asset;
  try {
    asset = JSON.parse(source);
    if (asset.poster && asset.provider === "mux" && thumbnailTime && parseInt(thumbnailTime) >= 0) {
      asset.providerMetadata.mux.thumbnailTime = thumbnailTime;
      const poster = new URL(asset.poster);
      poster.searchParams.set("time", thumbnailTime);
      asset.poster = `${poster}`;
      poster.searchParams.set("width", "16");
      poster.searchParams.set("height", "16");
      asset.blurDataURL = await createThumbHash(`${poster}`);
    }
  } catch {
    asset = { status: "error", message: "Invalid JSON" };
  }
  return `${JSON.stringify(asset)}`;
}
async function createThumbHash(imgUrl) {
  const response = await (0, import_undici.fetch)(imgUrl);
  const buffer = await response.arrayBuffer();
  const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return `data:image/webp;base64,${base64String}`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createThumbHash
});
