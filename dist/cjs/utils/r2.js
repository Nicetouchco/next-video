"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var r2_exports = {};
__export(r2_exports, {
  publicAccessR2Bucket: () => publicAccessR2Bucket
});
module.exports = __toCommonJS(r2_exports);
var import_undici = require("undici");
async function publicAccessR2Bucket(accountId, bucketName, apiToken) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/policy?access=PublicUrlAndCnames`;
  try {
    const { statusCode, body } = await (0, import_undici.request)(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      }
    });
    const responseBody = await body.json();
    if (statusCode !== 200 || !responseBody.success) {
      throw new Error(
        `Failed to set public access. Status code: ${statusCode}, Error details: ${JSON.stringify(responseBody.errors)}`
      );
    }
    if (responseBody.result.onlyViaCnames.length > 0) {
      return responseBody.result.onlyViaCnames[0];
    } else {
      return `${responseBody.result.publicId}.r2.dev`;
    }
  } catch (error) {
    throw new Error(`Error setting public access: ${error.message}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  publicAccessR2Bucket
});
