"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { forwardRef, Children, isValidElement, useState, Suspense } from "react";
import Media from "./media/index.js";
import { getPlaybackId, getPosterURLFromPlaybackId } from "../../providers/mux/transformer.js";
import { svgBlurImage } from "../utils.js";
const BackgroundPlayer = forwardRef(
  (allProps, forwardedRef) => {
    let { style, className, children, asset, poster, blurDataURL, onPlaying, onLoadStart, ...rest } = allProps;
    const slottedPoster = Children.toArray(children).find((child) => {
      return typeof child === "object" && "type" in child && child.props.slot === "poster";
    });
    if (isValidElement(slottedPoster)) {
      poster = "";
      blurDataURL = void 0;
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
    const [posterHidden, setPosterHidden] = useState(false);
    return /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("style", {
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
      /* @__PURE__ */ jsxs("div", { className: `${className ? `${className} ` : ""}next-video-bg`, style: { ...style }, children: [
        /* @__PURE__ */ jsx(
          Media,
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
        poster && /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsx("div", { className: "next-video-bg-text", children })
      ] })
    ] }) });
  }
);
var background_player_default = BackgroundPlayer;
export {
  background_player_default as default
};
