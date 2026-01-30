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
var media_exports = {};
__export(media_exports, {
  default: () => media_default
});
module.exports = __toCommonJS(media_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("react");
var import_utils = require("../../utils.js");
let MuxVideo;
let HlsVideo;
let DashVideo;
const Media = (0, import_react.forwardRef)((props, forwardedRef) => {
  if (typeof props.playbackId === "string") {
    MuxVideo ?? (MuxVideo = (0, import_react.lazy)(() => import("@mux/mux-video/react")));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MuxVideo, { ref: forwardedRef, ...props, controls: false });
  }
  const fileExtension = (0, import_utils.getUrlExtension)(props.src);
  if (fileExtension === "m3u8") {
    HlsVideo ?? (HlsVideo = (0, import_react.lazy)(() => import("hls-video-element/react")));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HlsVideo, { ref: forwardedRef, ...props, controls: false });
  }
  if (fileExtension === "mpd") {
    DashVideo ?? (DashVideo = (0, import_react.lazy)(() => import("dash-video-element/react")));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashVideo, { ref: forwardedRef, ...props, controls: false });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", { ref: forwardedRef, ...props, controls: false });
});
var media_default = Media;
