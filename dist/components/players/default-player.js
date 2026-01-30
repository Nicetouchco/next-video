"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { forwardRef, Suspense, Children, isValidElement } from "react";
import Sutro from "player.style/sutro/react";
import { getPlaybackId, getPosterURLFromPlaybackId } from "../../providers/mux/transformer.js";
import { svgBlurImage } from "../utils.js";
import Media from "./media/index.js";
const DefaultPlayer = forwardRef((allProps, forwardedRef) => {
  let {
    style,
    children,
    asset,
    controls = true,
    poster,
    blurDataURL,
    theme: Theme = Sutro,
    ...rest
  } = allProps;
  const slottedPoster = Children.toArray(children).find((child) => {
    return typeof child === "object" && "type" in child && child.props.slot === "poster";
  });
  let slottedPosterImg;
  if (isValidElement(slottedPoster)) {
    poster = "";
    blurDataURL = void 0;
    slottedPosterImg = slottedPoster;
    children = Children.toArray(children).filter((child) => child !== slottedPoster);
  }
  const props = rest;
  const imgStyleProps = {};
  const playbackId = asset ? getPlaybackId(asset) : void 0;
  let isCustomPoster = true;
  let srcSet;
  if (playbackId && asset?.status === "ready") {
    props.src = void 0;
    props.playbackId = playbackId;
    if (poster) {
      isCustomPoster = poster !== getPosterURLFromPlaybackId(playbackId, props);
      if (!isCustomPoster) {
        srcSet = `${getPosterURLFromPlaybackId(playbackId, { ...props, width: 480 })} 480w,${getPosterURLFromPlaybackId(playbackId, { ...props, width: 640 })} 640w,${getPosterURLFromPlaybackId(playbackId, { ...props, width: 960 })} 960w,${getPosterURLFromPlaybackId(playbackId, { ...props, width: 1280 })} 1280w,${getPosterURLFromPlaybackId(playbackId, { ...props, width: 1600 })} 1600w,${getPosterURLFromPlaybackId(playbackId, { ...props })} 1920w`;
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
      imgStyleProps.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${svgBlurImage(blurDataURL)}')`;
    }
  }
  delete props.thumbnailTime;
  if (controls && Theme) {
    const dataNextVideo = props["data-next-video"];
    if (poster) {
      slottedPosterImg = /* @__PURE__ */ jsx(
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
    return /* @__PURE__ */ jsxs(Theme, { "data-next-video": dataNextVideo, style: {
      display: "grid",
      ...style
    }, children: [
      slottedPosterImg,
      /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsxs(
        Media,
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
            playbackId && /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsxs(
    Media,
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
        playbackId && /* @__PURE__ */ jsx(
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
export {
  default_player_default as default
};
