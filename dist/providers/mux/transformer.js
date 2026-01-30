const MUX_VIDEO_DOMAIN = "mux.com";
function transform(asset, props) {
  const playbackId = getPlaybackId(asset);
  if (!playbackId) return asset;
  const thumbnailTime = asset.providerMetadata?.mux?.thumbnailTime ?? props?.thumbnailTime ?? props?.startTime;
  const transformedAsset = {
    ...asset,
    sources: [{
      src: `https://stream.${props?.customDomain ?? MUX_VIDEO_DOMAIN}/${playbackId}.m3u8`,
      type: "application/x-mpegURL"
    }],
    poster: getPosterURLFromPlaybackId(playbackId, {
      thumbnailTime,
      customDomain: props?.customDomain,
      token: props?.tokens?.thumbnail
    })
  };
  if (thumbnailTime >= 0) {
    transformedAsset.thumbnailTime = thumbnailTime;
  }
  return transformedAsset;
}
function getPlaybackId(asset) {
  const providerMetadata = asset.providerMetadata?.mux ?? asset.externalIds;
  return providerMetadata?.playbackId;
}
const getPosterURLFromPlaybackId = (playbackId, { token, thumbnailTime, width, customDomain = MUX_VIDEO_DOMAIN } = {}) => {
  const time = token == null ? thumbnailTime : void 0;
  const { aud } = parseJwt(token);
  if (token && aud !== "t") {
    return;
  }
  return `https://image.${customDomain}/${playbackId}/thumbnail.webp${toQuery({
    token,
    time,
    width
  })}`;
};
function toQuery(obj) {
  const params = toParams(obj).toString();
  return params ? "?" + params : "";
}
function toParams(obj) {
  const params = {};
  for (const key in obj) {
    if (obj[key] != null) params[key] = obj[key];
  }
  return new URLSearchParams(params);
}
function parseJwt(token) {
  const base64Url = (token ?? "").split(".")[1];
  if (!base64Url) return {};
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64).split("").map(function(c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join("")
  );
  return JSON.parse(jsonPayload);
}
export {
  getPlaybackId,
  getPosterURLFromPlaybackId,
  transform
};
