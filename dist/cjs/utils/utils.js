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
var utils_exports = {};
__export(utils_exports, {
  camelCase: () => camelCase,
  deepMerge: () => deepMerge,
  getPackageVersion: () => getPackageVersion,
  isObject: () => isObject,
  isRemote: () => isRemote,
  sleep: () => sleep,
  toSafePath: () => toSafePath
});
module.exports = __toCommonJS(utils_exports);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_resolve = __toESM(require("resolve"), 1);
function getPackageVersion(packageName) {
  const packageJsonPath = resolvePackageJson(packageName);
  if (packageJsonPath) {
    try {
      const packageJson = JSON.parse(
        import_node_fs.default.readFileSync(packageJsonPath, { encoding: "utf-8" })
      );
      return packageJson.version;
    } catch {
    }
  }
  return void 0;
}
function resolvePackageJson(packageName) {
  try {
    return import_resolve.default.sync(`${packageName}/package.json`, {
      basedir: process.cwd(),
      preserveSymlinks: true
    });
  } catch {
    return void 0;
  }
}
function sleep(ms) {
  return new Promise((resolve2) => setTimeout(resolve2, ms));
}
function camelCase(name) {
  return name.replace(/[-_]([a-z])/g, ($0, $1) => $1.toUpperCase());
}
function isRemote(filePath) {
  return /^https?:\/\//.test(filePath);
}
function toSafePath(str) {
  return str.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_");
}
function deepMerge(...objects) {
  const result = {};
  for (const obj of objects) {
    for (const key in obj) {
      const existing = result[key];
      const val = obj[key];
      if (Array.isArray(val) && Array.isArray(existing)) {
        result[key] = existing.concat(...val);
      } else if (isObject(val) && isObject(existing)) {
        result[key] = deepMerge(existing, val);
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  camelCase,
  deepMerge,
  getPackageVersion,
  isObject,
  isRemote,
  sleep,
  toSafePath
});
