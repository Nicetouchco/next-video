import { request } from "undici";
async function publicAccessR2Bucket(accountId, bucketName, apiToken) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/policy?access=PublicUrlAndCnames`;
  try {
    const { statusCode, body } = await request(url, {
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
export {
  publicAccessR2Bucket
};
