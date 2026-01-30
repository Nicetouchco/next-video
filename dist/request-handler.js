import { callHandler } from "./process.js";
import { createAsset, getAsset } from "./assets.js";
import { getVideoConfig } from "./config.js";
async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const { status, data } = await getRequest(url);
  return Response.json(data, { status });
}
async function POST(request) {
  const { url } = await request.json();
  const { status, data } = await postRequest(url);
  return Response.json(data, { status });
}
async function handler(req, res) {
  if (req.method === "POST") {
    const { status: status2, data: data2 } = await postRequest(String(req.body.url));
    res.status(status2).json(data2);
    return;
  }
  const { status, data } = await getRequest(String(req.query.url));
  res.status(status).json(data);
}
async function getRequest(url) {
  if (!url) {
    return {
      status: 400,
      data: { error: "url parameter is required" }
    };
  }
  let asset;
  try {
    asset = await getAsset(url);
  } catch {
    const isDevMode = true;
    if (isDevMode) {
      asset = await createAsset(url);
      if (asset) {
        const videoConfig = await getVideoConfig();
        await callHandler("request.video.added", asset, videoConfig);
        return { status: 200, data: asset };
      } else {
        return { status: 500, data: { error: "could not create asset" } };
      }
    }
    return { status: 404, data: { error: "asset not found" } };
  }
  return { status: 200, data: asset };
}
async function postRequest(url) {
  if (!url) {
    return {
      status: 400,
      data: { error: "url parameter is required" }
    };
  }
  let asset;
  try {
    asset = await createAsset(url);
    if (!asset) {
      return { status: 500, data: { error: "could not create asset" } };
    }
    const videoConfig = await getVideoConfig();
    await callHandler("request.video.added", asset, videoConfig);
    return { status: 200, data: asset };
  } catch {
    return { status: 500, data: { error: "could not create asset" } };
  }
}
export {
  GET,
  POST,
  handler as default
};
