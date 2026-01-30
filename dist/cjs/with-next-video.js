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
var with_next_video_exports = {};
__export(with_next_video_exports, {
  withNextVideo: () => withNextVideo
});
module.exports = __toCommonJS(with_next_video_exports);
var import_symlink_dir = __toESM(require("symlink-dir"), 1);
var import_node_path = require("node:path");
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_process = require("node:process");
var import_node_url = require("node:url");
var import_logger = __toESM(require("./utils/logger.js"), 1);
var import_utils = require("./utils/utils.js");
var import_config = require("./config.js");
let hasWarned = false;
function withNextVideo(nextConfig, videoConfig) {
  const videoConfigComplete = (0, import_config.setVideoConfig)(videoConfig);
  const { path, folder, provider } = videoConfigComplete;
  import_node_process.env["NEXT_PUBLIC_VIDEO_OPTS"] = JSON.stringify({ path, folder, provider });
  if (process.argv[2] === "dev") {
    import_node_process.env["NEXT_PUBLIC_DEV_VIDEO_OPTS"] = JSON.stringify({ path, folder, provider });
  }
  if (typeof nextConfig === "function") {
    return async (...args) => {
      const nextConfigResult = await nextConfig(...args);
      return withNextVideo(nextConfigResult, videoConfig);
    };
  }
  if (process.argv[2] === "dev") {
    const VIDEOS_PATH = (0, import_node_path.join)(process.cwd(), folder);
    const TMP_PUBLIC_VIDEOS_PATH = (0, import_node_path.join)(process.cwd(), "public", `_next-video`);
    (0, import_symlink_dir.default)(VIDEOS_PATH, TMP_PUBLIC_VIDEOS_PATH);
    process.on("exit", async () => {
      import_node_fs.default.unlinkSync(TMP_PUBLIC_VIDEOS_PATH);
    });
  }
  const nextVersion = (0, import_utils.getPackageVersion)("next");
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
  const nextVideoVersion = (0, import_utils.getPackageVersion)("next-video");
  if (!hasWarned && process.env.TURBOPACK && !process.env.NEXT_VIDEO_SUPPRESS_TURBOPACK_WARNING && nextVersion && isVersionLessThan(nextVersion, "15.5.0")) {
    hasWarned = true;
    import_logger.default.space(import_logger.default.label(`\u25B6\uFE0E next-video ${nextVideoVersion}
`));
    import_logger.default.warning(
      `You are using next-video with \`next ${process.env.NODE_ENV === "development" ? "dev" : "build"} --turbo\`. next-video doesn't support Turbopack on Next.js 15.5.0 and below.
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
      const scriptDir = typeof __dirname === "string" ? __dirname : (0, import_node_path.dirname)((0, import_node_url.fileURLToPath)(""));
      config.module.rules.push(
        {
          test: /\.(mp4|webm|mkv|ogg|ogv|wmv|avi|mov|flv|m4v|3gp)\??(?:&?[^=&]*=[^=&]*)*$/,
          use: [
            {
              loader: (0, import_node_path.join)(scriptDir, "webpack/video-json-loader.js")
            },
            {
              loader: (0, import_node_path.join)(scriptDir, "webpack/video-raw-loader.js")
            }
          ],
          type: "json"
        },
        {
          test: /\.(mp4|webm|mkv|ogg|ogv|wmv|avi|mov|flv|m4v|3gp)\.json\??(?:&?[^=&]*=[^=&]*)*$/,
          use: [
            {
              loader: (0, import_node_path.join)(scriptDir, "webpack/video-json-loader.js")
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  withNextVideo
});
