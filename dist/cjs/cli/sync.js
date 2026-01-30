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
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
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
var sync_exports = {};
__export(sync_exports, {
  builder: () => builder,
  command: () => command,
  desc: () => desc,
  handler: () => handler
});
module.exports = __toCommonJS(sync_exports);
var import_chalk = __toESM(require("chalk"), 1);
var import_chokidar = __toESM(require("chokidar"), 1);
var import_node_process = require("node:process");
var import_promises = require("node:fs/promises");
var import_node_path = __toESM(require("node:path"), 1);
var import_process = require("../process.js");
var import_assets = require("../assets.js");
var import_config = require("../config.js");
var import_utils = require("../utils/utils.js");
var import_logger = __toESM(require("../utils/logger.js"), 1);
const command = "sync";
const desc = "Checks for new video files in the videos directory, uploads them, and checks any existing assets for updates.";
function builder(yargs) {
  return yargs.options({
    dir: {
      alias: "d",
      describe: "The directory you initialized next-video with.",
      type: "string",
      default: "videos"
    },
    watch: {
      alias: "w",
      describe: "Watch the videos directory for changes.",
      type: "boolean",
      default: false
    }
  });
}
function watcher(dir) {
  const watcher2 = import_chokidar.default.watch(dir, {
    ignored: /(^|[\/\\])\..*|\.json$|\.ts$/,
    persistent: true
  });
  watcher2.on("add", async (filePath) => {
    try {
      await (0, import_assets.getAsset)(filePath);
    } catch {
      const newAsset = await (0, import_assets.createAsset)(filePath);
      if (newAsset) {
        import_logger.default.add(`New file found: ${filePath}`);
        const videoConfig = await (0, import_config.getVideoConfig)();
        return (0, import_process.callHandler)("local.video.added", newAsset, videoConfig);
      }
    }
  });
}
async function handler(argv) {
  const directoryPath = import_node_path.default.join((0, import_node_process.cwd)(), argv.dir);
  const version = (0, import_utils.getPackageVersion)("next-video");
  import_logger.default.space(import_logger.default.label(`\u25B6\uFE0E next-video ${version}`));
  import_logger.default.space();
  try {
    const files = (await getFiles(directoryPath)).map((file) => import_node_path.default.relative(directoryPath, file));
    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    const otherFiles = files.filter((file) => !file.match(/(^|[\/\\])\..*|\.json$|\.ts$/));
    const newFileProcessor = async (file) => {
      import_logger.default.info(import_logger.default.label("Processing file:"), file);
      const filePath = import_node_path.default.join(directoryPath, file);
      const newAsset = await (0, import_assets.createAsset)(filePath);
      if (newAsset) {
        const videoConfig = await (0, import_config.getVideoConfig)();
        return (0, import_process.callHandler)("local.video.added", newAsset, videoConfig);
      }
    };
    const existingFileProcessor = async (file) => {
      const filePath = import_node_path.default.join(directoryPath, file);
      const parsedPath = import_node_path.default.parse(filePath);
      const assetPath = import_node_path.default.join(parsedPath.dir, parsedPath.name);
      const existingAsset = await (0, import_assets.getAsset)(assetPath);
      const assetStatus = existingAsset?.status;
      if (assetStatus && ["sourced", "pending", "uploading", "processing"].includes(assetStatus)) {
        const videoConfig = await (0, import_config.getVideoConfig)();
        return (0, import_process.callHandler)("local.video.added", existingAsset, videoConfig);
      }
    };
    const unprocessedFilter = (file) => {
      const jsonFile = `${file}.json`;
      return !jsonFiles.includes(jsonFile);
    };
    const unprocessedVideos = otherFiles.filter(unprocessedFilter);
    if (unprocessedVideos.length > 0) {
      const s = unprocessedVideos.length === 1 ? "" : "s";
      import_logger.default.add(`Found ${unprocessedVideos.length} unprocessed video${s}`);
    }
    const processing = await Promise.all([
      ...unprocessedVideos.map(newFileProcessor),
      ...jsonFiles.map(existingFileProcessor)
    ]);
    const processed = processing.flat().filter((asset) => asset);
    if (processed.length > 0) {
      const s = processed.length === 1 ? "" : "s";
      import_logger.default.success(
        `Processed (or resumed processing) ${processed.length} video${s}`
      );
    } else {
      import_logger.default.info("No new or unprocessed videos found");
    }
    if (argv.watch) {
      const relativePath = import_node_path.default.relative((0, import_node_process.cwd)(), directoryPath);
      import_logger.default.info(`Watching for file changes in ./${relativePath}`);
      import_logger.default.space();
      watcher(directoryPath);
    }
  } catch (err) {
    if (err.code === "ENOENT" && err.path === directoryPath) {
      import_logger.default.warning(`Directory does not exist: ${directoryPath}`);
      import_logger.default.info(
        `Did you forget to run ${import_chalk.default.bold.magenta("next-video init")}? You can also use the ${import_chalk.default.bold(
          "--dir"
        )} flag to specify a different directory.`
      );
      return;
    }
    if (err.code === "ENOENT") {
      import_logger.default.warning(`Source video file does not exist: ${err.path}`);
      return;
    }
    if (err.message.includes("MUX_TOKEN_ID environment variable is missing or empty") || err.message.includes("MUX_TOKEN_SECRET environment variable is missing or empty")) {
      import_logger.default.error(`Mux MUX_TOKEN_ID or MUX_TOKEN_SECRET can't be found. Visit \x1B[4;34mhttps://next-video.dev/docs#remote-storage-and-optimization\x1B[0m for more information.`);
      return;
    }
    import_logger.default.error("An unknown error occurred", err);
  }
}
async function getFiles(dir) {
  const dirents = await (0, import_promises.readdir)(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = import_node_path.default.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  builder,
  command,
  desc,
  handler
});
