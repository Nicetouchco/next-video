import { setVideoConfig } from "./config.js";
import handler, { GET, POST } from "./request-handler.js";
import { withNextVideo as withNextVideoInternal } from "./with-next-video.js";
function NextVideo(config) {
  setVideoConfig(config);
  const withNextVideo = (nextConfig) => {
    return withNextVideoInternal(nextConfig, config);
  };
  return {
    GET,
    POST,
    handler,
    withNextVideo
  };
}
export {
  NextVideo
};
