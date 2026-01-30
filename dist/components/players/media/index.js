import { jsx } from "react/jsx-runtime";
import { forwardRef, lazy } from "react";
import { getUrlExtension } from "../../utils.js";
let MuxVideo;
let HlsVideo;
let DashVideo;
const Media = forwardRef((props, forwardedRef) => {
  if (typeof props.playbackId === "string") {
    MuxVideo ?? (MuxVideo = lazy(() => import("@mux/mux-video/react")));
    return /* @__PURE__ */ jsx(MuxVideo, { ref: forwardedRef, ...props, controls: false });
  }
  const fileExtension = getUrlExtension(props.src);
  if (fileExtension === "m3u8") {
    HlsVideo ?? (HlsVideo = lazy(() => import("hls-video-element/react")));
    return /* @__PURE__ */ jsx(HlsVideo, { ref: forwardedRef, ...props, controls: false });
  }
  if (fileExtension === "mpd") {
    DashVideo ?? (DashVideo = lazy(() => import("dash-video-element/react")));
    return /* @__PURE__ */ jsx(DashVideo, { ref: forwardedRef, ...props, controls: false });
  }
  return /* @__PURE__ */ jsx("video", { ref: forwardedRef, ...props, controls: false });
});
var media_default = Media;
export {
  media_default as default
};
