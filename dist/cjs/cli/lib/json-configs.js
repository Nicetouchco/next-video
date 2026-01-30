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
var json_configs_exports = {};
__export(json_configs_exports, {
  checkPackageJsonForNextVideo: () => checkPackageJsonForNextVideo,
  updateTSConfigFileContent: () => updateTSConfigFileContent
});
module.exports = __toCommonJS(json_configs_exports);
var import_promises = require("node:fs/promises");
var import_constants = require("../../constants.js");
function updateTSConfigFileContent(tsContents) {
  const newItem = "video.d.ts";
  const includeRegex = /("include"\s*:\s*\[)([^\]]*?)(\])/;
  const addVideoDts = (_match, p1, p2, p3) => {
    const trimmedContent = p2.trim();
    if (/\r?\n/.test(p2)) {
      const whitespace = p2.match(/^\s*/)?.[0] || "";
      return `${p1}${whitespace}"${newItem}",${p2}${p3}`;
    } else {
      return `${p1}"${newItem}", ${trimmedContent ? `${trimmedContent}` : ""}${p3}`;
    }
  };
  const updatedContents = tsContents.replace(includeRegex, addVideoDts);
  JSON.parse(updatedContents);
  return updatedContents;
}
async function checkPackageJsonForNextVideo(packagePath = "./package.json") {
  const pkg = await (0, import_promises.readFile)(packagePath, "utf-8");
  const json = JSON.parse(pkg);
  return !!(json.devDependencies?.[import_constants.PACKAGE_NAME] || json.dependencies?.[import_constants.PACKAGE_NAME]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkPackageJsonForNextVideo,
  updateTSConfigFileContent
});
