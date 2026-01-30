"use strict";
"use client";
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
var background_player_exports = {};
__export(background_player_exports, {
  default: () => background_player_default
});
module.exports = __toCommonJS(background_player_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("react");
var import_media = __toESM(require("./media/index.js"), 1);
var import_transformer = require("../../providers/mux/transformer.js");
var import_utils = require("../utils.js");
const BackgroundPlayer = (0, import_react.forwardRef)(
  (allProps, forwardedRef) => {
    let { style, className, children, asset, poster, blurDataURL, onPlaying, onLoadStart, ...rest } = allProps;
    const slottedPoster = import_react.Children.toArray(children).find((child) => {
      return typeof child === "object" && "type" in child && child.props.slot === "poster";
    });
    if ((0, import_react.isValidElement)(slottedPoster)) {
      poster = "";
      blurDataURL = void 0;
    }
    const props = rest;
    const imgStyleProps = {};
    const playbackId = asset ? (0, import_transformer.getPlaybackId)(asset) : void 0;
    let isCustomPoster = true;
    let srcSet;
    if (playbackId && asset?.status === "ready") {
      props.src = void 0;
      props.playbackId = playbackId;
      if (poster) {
        isCustomPoster = poster !== (0, import_transformer.getPosterURLFromPlaybackId)(playbackId, props);
        if (!isCustomPoster) {
          srcSet = `${(0, import_transformer.getPosterURLFromPlaybackId)(playbackId, { ...props, width: 480 })} 480w,${(0, import_transformer.getPosterURLFromPlaybackId)(playbackId, { ...props, width: 640 })} 640w,${(0, import_transformer.getPosterURLFromPlaybackId)(playbackId, { ...props, width: 960 })} 960w,${(0, import_transformer.getPosterURLFromPlaybackId)(playbackId, { ...props, width: 1280 })} 1280w,${(0, import_transformer.getPosterURLFromPlaybackId)(playbackId, { ...props, width: 1600 })} 1600w,${(0, import_transformer.getPosterURLFromPlaybackId)(playbackId, { ...props })} 1920w`;
        }
      }
    }
    if (blurDataURL) {
      const showGeneratedBlur = !isCustomPoster && blurDataURL === asset?.blurDataURL;
      const showCustomBlur = isCustomPoster && blurDataURL !== asset?.blurDataURL;
      if (showGeneratedBlur || showCustomBlur) {
        imgStyleProps.width = "100%";
        imgStyleProps.height = "100%";
        imgStyleProps.color = "transparent";
        imgStyleProps.backgroundSize = "cover";
        imgStyleProps.backgroundPosition = "center";
        imgStyleProps.backgroundRepeat = "no-repeat";
        imgStyleProps.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${(0, import_utils.svgBlurImage)(blurDataURL)}')`;
      }
    }
    delete props.thumbnailTime;
    const [posterHidden, setPosterHidden] = (0, import_react.useState)(false);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", {
        /* css */
        children: `
        .next-video-bg {
          width: 100%;
          height: 100%;
          display: grid;
        }

        .next-video-bg-video,
        .next-video-bg-poster,
        .next-video-bg-text {
          grid-area: 1 / 1;
          min-height: 0;
        }

        .next-video-bg-poster {
          position: relative;
          object-fit: cover;
          pointer-events: none;
          transition: opacity .25s;
        }

        .next-video-bg-poster[hidden] {
          opacity: 0;
        }

        .next-video-bg-video {
          object-fit: cover;
          --media-object-fit: cover;
        }

        .next-video-bg-text {
          position: relative;
          display: grid;
          place-content: center;
          padding: 5% 5% 10%;
        }
        `
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${className ? `${className} ` : ""}next-video-bg`, style: { ...style }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_media.default,
          {
            suppressHydrationWarning: true,
            ref: forwardedRef,
            className: "next-video-bg-video",
            onPlaying: (event) => {
              onPlaying?.(event);
              setPosterHidden(true);
            },
            onLoadStart: (event) => {
              onLoadStart?.(event);
              setPosterHidden(false);
            },
            muted: true,
            autoPlay: true,
            loop: true,
            playsInline: true,
            ...props
          }
        ),
        poster && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "img",
          {
            className: "next-video-bg-poster",
            src: isCustomPoster ? poster : void 0,
            srcSet,
            style: imgStyleProps,
            hidden: posterHidden,
            decoding: "async",
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "next-video-bg-text", children })
      ] })
    ] }) });
  }
);
var background_player_default = BackgroundPlayer;
