"use client";
import { jsx } from "react/jsx-runtime";
import { forwardRef } from "react";
import BackgroundPlayer from "./players/background-player.js";
import Video from "./video.js";
const BackgroundVideo = forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsx(
    Video,
    {
      ref: forwardedRef,
      as: BackgroundPlayer,
      thumbnailTime: 0,
      ...props
    }
  );
});
var background_video_default = BackgroundVideo;
export {
  background_video_default as default
};
