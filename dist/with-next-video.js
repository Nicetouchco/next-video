import symlinkDir from "symlink-dir";
import { join, dirname } from "node:path";
import fs from "node:fs";
import { env } from "node:process";
import { fileURLToPath } from "node:url";
import logger from "./utils/logger.js";
import { getPackageVersion } from "./utils/utils.js";
import { setVideoConfig } from "./config.js";
let hasWarned = false;
function withNextVideo(nextConfig, videoConfig) {
  const videoConfigComplete = setVideoConfig(videoConfig);
  const { path, folder, provider } = videoConfigComplete;
  env["NEXT_PUBLIC_VIDEO_OPTS"] = JSON.stringify({ path, folder, provider });
  if (process.argv[2] === "dev") {
    env["NEXT_PUBLIC_DEV_VIDEO_OPTS"] = JSON.stringify({ path, folder, provider });
  }
  if (typeof nextConfig === "function") {
    return async (...args) => {
      const nextConfigResult = await nextConfig(...args);
      return withNextVideo(nextConfigResult, videoConfig);
    };
  }
  if (process.argv[2] === "dev") {
    const VIDEOS_PATH = join(process.cwd(), folder);
    const TMP_PUBLIC_VIDEOS_PATH = join(process.cwd(), "public", `_next-video`);
    symlinkDir(VIDEOS_PATH, TMP_PUBLIC_VIDEOS_PATH);
    process.on("exit", async () => {
      fs.unlinkSync(TMP_PUBLIC_VIDEOS_PATH);
    });
  }
  const nextVersion = getPackageVersion("next");
  const majorVersion = nextVersion ? parseInt(nextVersion.split(".")[0], 10) : void 0;
  if (majorVersion && majorVersion >= 15) {
    nextConfig.outputFileTracingIncludes = {
      ...nextConfig.outputFileTracingIncludes,
      [path]: [`./${folder}/**/*.json`]
    };
  } else {
    const experimental = { ...nextConfig.experimental };
    experimental.outputFileTracingIncludes = {
      ...experimental.outputFileTracingIncludes,
      [path]: [`./${folder}/**/*.json`]
    };
    nextConfig.experimental = experimental;
  }
  nextConfig.turbopack = {
    ...nextConfig.turbopack,
    rules: {
      ...nextConfig.turbopack?.rules,
      "*.mp4": {
        loaders: [
          "next-video/webpack/video-raw-loader.js"
        ],
        as: "*.json"
      },
      "*.json": {
        loaders: [
          "next-video/webpack/video-json-loader.js"
        ],
        as: "*.json"
      }
    }
  };
  const nextVideoVersion = getPackageVersion("next-video");
  if (!hasWarned && process.env.TURBOPACK && !process.env.NEXT_VIDEO_SUPPRESS_TURBOPACK_WARNING && nextVersion && isVersionLessThan(nextVersion, "15.5.0")) {
    hasWarned = true;
    logger.space(logger.label(`\u25B6\uFE0E next-video ${nextVideoVersion}
`));
    logger.warning(
      `You are using next-video with \`next ${true ? "dev" : "build"} --turbo\`. next-video doesn't support Turbopack on Next.js 15.5.0 and below.
  We recommend removing the \`--turbo\` flag for use with next-video.
`
    );
  }
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      if (!options.defaultLoaders) {
        throw new Error(
          "This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade"
        );
      }
      config.infrastructureLogging = {
        ...config.infrastructureLogging,
        // Silence warning about dynamic import of next.config file.
        // > [webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo] Parsing of /next-video/dist/config.js for build dependencies failed at 'import(fileUrl.
        // > Build dependencies behind this expression are ignored and might cause incorrect cache invalidation.
        level: "error"
      };
      config.experiments.buildHttp = {
        allowedUris: [
          /https?:\/\/.*\.(mp4|webm|mkv|ogg|ogv|wmv|avi|mov|flv|m4v|3gp)\??(?:&?[^=&]*=[^=&]*)*$/,
          ...config.experiments.buildHttp?.allowedUris ?? []
        ],
        ...config.experiments.buildHttp || {},
        // Disable cache to prevent Webpack from downloading the remote sources.
        cacheLocation: false
      };
      const scriptDir = typeof __dirname === "string" ? __dirname : dirname(fileURLToPath(import.meta.url));
      config.module.rules.push(
        {
          test: /\.(mp4|webm|mkv|ogg|ogv|wmv|avi|mov|flv|m4v|3gp)\??(?:&?[^=&]*=[^=&]*)*$/,
          use: [
            {
              loader: join(scriptDir, "webpack/video-json-loader.js")
            },
            {
              loader: join(scriptDir, "webpack/video-raw-loader.js")
            }
          ],
          type: "json"
        },
        {
          test: /\.(mp4|webm|mkv|ogg|ogv|wmv|avi|mov|flv|m4v|3gp)\.json\??(?:&?[^=&]*=[^=&]*)*$/,
          use: [
            {
              loader: join(scriptDir, "webpack/video-json-loader.js")
            }
          ],
          type: "json"
        }
      );
      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }
      return config;
    }
  });
}
const isVersionLessThan = (version, target) => {
  const parseVersion = (v) => v.split(".").map((n) => parseInt(n, 10));
  const versionParts = parseVersion(version);
  const targetParts = parseVersion(target);
  for (let i = 0; i < Math.max(versionParts.length, targetParts.length); i++) {
    const vPart = versionParts[i] || 0;
    const tPart = targetParts[i] || 0;
    if (vPart < tPart) return true;
    if (vPart > tPart) return false;
  }
  return false;
};
export {
  withNextVideo
};
