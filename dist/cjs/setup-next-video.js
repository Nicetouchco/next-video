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
var setup_next_video_exports = {};
__export(setup_next_video_exports, {
  NextVideo: () => NextVideo
});
module.exports = __toCommonJS(setup_next_video_exports);
var import_config = require("./config.js");
var import_request_handler = __toESM(require("./request-handler.js"), 1);
var import_with_next_video = require("./with-next-video.js");
function NextVideo(config) {
  (0, import_config.setVideoConfig)(config);
  const withNextVideo = (nextConfig) => {
    return (0, import_with_next_video.withNextVideo)(nextConfig, config);
  };
  return {
    GET: import_request_handler.GET,
    POST: import_request_handler.POST,
    handler: import_request_handler.default,
    withNextVideo
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NextVideo
});
