import path from "node:path";
import { readFile } from "node:fs/promises";
import { createAsset, getAssetConfigPath } from "../assets.js";
const raw = true;
async function loader() {
  const params = new URLSearchParams(this.resourceQuery);
  params.delete("thumbnailTime");
  const query = params.size ? `?${params}` : "";
  const importPath = `${this.resourcePath}${query}`;
  const assetPath = path.resolve(await getAssetConfigPath(importPath));
  this.addDependency(assetPath);
  let asset;
  try {
    asset = await readFile(assetPath, "utf-8");
  } catch {
    asset = JSON.stringify(await createAsset(importPath, {
      status: "sourced"
    }));
  }
  return `${asset}`;
}
export {
  loader as default,
  raw
};
