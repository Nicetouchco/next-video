function transform(asset) {
  const providerMetadata = asset.providerMetadata?.["cloudflare-r2"];
  if (!providerMetadata) return asset;
  const src = new URL(providerMetadata.bucketUrlPublic);
  src.pathname = providerMetadata.key;
  const source = { src: `${src}` };
  return {
    ...asset,
    sources: [source]
  };
}
export {
  transform
};
