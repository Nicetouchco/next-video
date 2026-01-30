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
var provider_exports = {};
__export(provider_exports, {
  uploadLocalFile: () => uploadLocalFile,
  uploadRequestedFile: () => uploadRequestedFile
});
module.exports = __toCommonJS(provider_exports);
var import_node_fs = require("node:fs");
var import_node_stream = require("node:stream");
var import_promises = __toESM(require("node:fs/promises"), 1);
var import_node_process = require("node:process");
var import_undici = require("undici");
var import_chalk = __toESM(require("chalk"), 1);
var import_cuid2 = __toESM(require("@paralleldrive/cuid2"), 1);
var import_client_s3 = require("@aws-sdk/client-s3");
var import_assets = require("../../assets.js");
var import_config = require("../../config.js");
var import_s3 = require("../../utils/s3.js");
var import_provider = require("../../utils/provider.js");
var import_utils = require("../../utils/utils.js");
var import_logger = __toESM(require("../../utils/logger.js"), 1);
var import_r2 = require("../../utils/r2.js");
const createId = import_cuid2.default.init({ length: 11 });
let s3;
let bucketName;
let bucketUrlPublic;
let accountId;
let endpoint;
async function initR2() {
  const { providerConfig } = await (0, import_config.getVideoConfig)();
  const CloudflareR2Config = providerConfig["cloudflare-r2"];
  bucketName = CloudflareR2Config?.bucket ?? "";
  bucketUrlPublic = CloudflareR2Config?.bucketUrlPublic ?? "";
  endpoint = CloudflareR2Config?.endpoint ?? "";
  accountId = endpoint.split(".")[0].replace(/^https?:\/\//, "");
  s3 ?? (s3 = new import_client_s3.S3Client({
    endpoint,
    // region does not have any impact on Cloudflare R2
    region: "auto",
    credentials: {
      accessKeyId: CloudflareR2Config?.accessKeyId ?? import_node_process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: CloudflareR2Config?.secretAccessKey ?? import_node_process.env.R2_SECRET_ACCESS_KEY ?? ""
    }
  }));
  if (!bucketName) {
    try {
      const bucket = await (0, import_s3.findBucket)(s3, (bucket2) => bucket2.Name?.startsWith("next-videos-"));
      if (bucket) {
        bucketName = bucket.Name;
        import_logger.default.info(import_logger.default.label("Using existing Cloudflare R2 bucket:"), bucketName);
      }
    } catch (err) {
      import_logger.default.error("Error listing Cloudflare R2 buckets");
      console.error(err);
    }
  }
  if (!bucketName) {
    bucketName = `next-videos-${createId()}`;
    import_logger.default.info(import_logger.default.label("Creating Cloudflare R2 bucket:"), bucketName);
    try {
      await (0, import_s3.createBucket)(s3, bucketName, {});
      await (0, import_s3.putBucketCors)(s3, bucketName);
    } catch (err) {
      import_logger.default.error("Error creating Cloudflare R2 bucket");
      console.error(err);
    }
  }
  if (!bucketUrlPublic && bucketName) {
    const cloudflareApiToken = CloudflareR2Config?.apiToken ?? import_node_process.env.R2_CF_API_TOKEN ?? "";
    let bucketPublicId;
    if (cloudflareApiToken) {
      try {
        bucketPublicId = await (0, import_r2.publicAccessR2Bucket)(accountId, bucketName, cloudflareApiToken) ?? "";
        bucketUrlPublic = `https://${bucketPublicId}`;
      } catch (e) {
        import_logger.default.error(`Error setting Public access for Cloudflare R2 bucket: ${bucketName}`);
        console.error(e);
        return;
      }
    }
  }
}
async function uploadLocalFile(asset) {
  const filePath = asset.originalFilePath;
  if (!filePath) {
    import_logger.default.error("No filePath provided for asset.");
    console.error(asset);
    return;
  }
  if ((0, import_utils.isRemote)(filePath)) {
    return uploadRequestedFile(asset);
  }
  if (asset.status === "ready") {
    return;
  } else if (asset.status === "uploading") {
    import_logger.default.info(import_logger.default.label("Resuming upload:"), filePath);
  }
  await (0, import_assets.updateAsset)(filePath, {
    status: "uploading"
  });
  await initR2();
  if (!bucketUrlPublic) {
    import_logger.default.error(
      `Public access configuration missing:
      Neither the Cloudflare API Key nor the bucketUrlPublic URL is specified for the bucket "${bucketName}".
   
      To enable public access, you must ensure one of the following:
      1. **Configure the Bucket for Public Access:**
         - Make sure the bucket "${bucketName}" is configured for public access
           and specify the public URL in the provider configuration under the key 'bucketUrlPublic'.
         - For detailed instructions, refer to the Cloudflare documentation: 
           https://developers.cloudflare.com/r2/buckets/public-buckets/
   
      2. **Provide a Cloudflare API Key:**
         - You can specify a Cloudflare API Key with R2 Admin read & write permissions using the environment variable: R2_CF_API_TOKEN.
         - This API Key will allow us to enable public access for the bucket and retrieve the public URL using the Cloudflare API.
         - To create an API Token, visit:
           https://dash.cloudflare.com/?to=/:account/r2/api-tokens`
    );
    return;
  }
  const fileStats = await import_promises.default.stat(filePath);
  const stream = (0, import_node_fs.createReadStream)(filePath);
  return putAsset(filePath, fileStats.size, stream);
}
async function uploadRequestedFile(asset) {
  const filePath = asset.originalFilePath;
  if (!filePath) {
    import_logger.default.error("No URL provided for asset.");
    console.error(asset);
    return;
  }
  if (asset.status === "ready") {
    return;
  }
  await (0, import_assets.updateAsset)(filePath, {
    status: "uploading"
  });
  await initR2();
  const response = await (0, import_undici.fetch)(filePath);
  const size = Number(response.headers.get("content-length"));
  const stream = response.body;
  if (!stream) {
    import_logger.default.error("Error fetching the requested file:", filePath);
    return;
  }
  return putAsset(filePath, size, import_node_stream.Readable.fromWeb(stream));
}
async function putAsset(filePath, size, stream) {
  import_logger.default.info(import_logger.default.label("Uploading file:"), `${filePath} (${size} bytes)`);
  let key;
  try {
    key = await (0, import_provider.createAssetKey)(filePath, "cloudflare-r2");
    await (0, import_s3.putObject)(s3, {
      ACL: "public-read",
      Bucket: bucketName,
      Key: key,
      Body: stream,
      ContentLength: size
    });
    if (stream instanceof import_node_fs.ReadStream) {
      stream.close();
    }
  } catch (e) {
    import_logger.default.error("Error uploading to Cloudflare R2");
    console.error(e);
    return;
  }
  import_logger.default.success(import_logger.default.label("File uploaded:"), `${filePath} (${size} bytes)`);
  const updatedAsset = await (0, import_assets.updateAsset)(filePath, {
    status: "ready",
    providerMetadata: {
      "cloudflare-r2": {
        endpoint,
        bucketUrlPublic,
        bucket: bucketName,
        key
      }
    }
  });
  const url = updatedAsset.sources?.[0].src;
  import_logger.default.space(import_chalk.default.gray(">"), import_logger.default.label("URL:"), url);
  return updatedAsset;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  uploadLocalFile,
  uploadRequestedFile
});
