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
var default_player_exports = {};
__export(default_player_exports, {
  default: () => default_player_default
});
module.exports = __toCommonJS(default_player_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = require("react");
var import_react2 = __toESM(require("player.style/sutro/react"), 1);
var import_transformer = require("../../providers/mux/transformer.js");
var import_utils = require("../utils.js");
var import_media = __toESM(require("./media/index.js"), 1);
const DefaultPlayer = (0, import_react.forwardRef)((allProps, forwardedRef) => {
  let {
    style,
    children,
    asset,
    controls = true,
    poster,
    blurDataURL,
    theme: Theme = import_react2.default,
    ...rest
  } = allProps;
  const slottedPoster = import_react.Children.toArray(children).find((child) => {
    return typeof child === "object" && "type" in child && child.props.slot === "poster";
  });
  let slottedPosterImg;
  if ((0, import_react.isValidElement)(slottedPoster)) {
    poster = "";
    blurDataURL = void 0;
    slottedPosterImg = slottedPoster;
    children = import_react.Children.toArray(children).filter((child) => child !== slottedPoster);
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
      imgStyleProps.gridArea = "1/1";
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
  if (controls && Theme) {
    const dataNextVideo = props["data-next-video"];
    if (poster) {
      slottedPosterImg = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "img",
        {
          slot: "poster",
          src: isCustomPoster ? poster : void 0,
          srcSet,
          style: imgStyleProps,
          decoding: "async",
          "aria-hidden": "true"
        }
      );
      poster = "";
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Theme, { "data-next-video": dataNextVideo, style: {
      display: "grid",
      ...style
    }, children: [
      slottedPosterImg,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        import_media.default,
        {
          suppressHydrationWarning: true,
          ref: forwardedRef,
          style: {
            gridArea: "1/1"
          },
          slot: "media",
          poster,
          crossOrigin: "",
          ...props,
          children: [
            playbackId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "track",
              {
                default: true,
                kind: "metadata",
                label: "thumbnails",
                src: `https://image.mux.com/${playbackId}/storyboard.vtt`
              }
            ),
            children
          ]
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, { fallback: null, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_media.default,
    {
      suppressHydrationWarning: true,
      ref: forwardedRef,
      style: {
        gridArea: "1/1",
        ...style
      },
      controls: controls === false ? void 0 : true,
      poster,
      crossOrigin: "",
      ...props,
      children: [
        playbackId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "track",
          {
            default: true,
            kind: "metadata",
            label: "thumbnails",
            src: `https://image.mux.com/${playbackId}/storyboard.vtt`
          }
        ),
        children
      ]
    }
  ) });
});
var default_player_default = DefaultPlayer;
