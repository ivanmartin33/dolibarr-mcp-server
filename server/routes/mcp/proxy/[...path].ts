import { ofetch } from "ofetch";
import { getMethod, readBody, setResponseStatus, eventHandler } from "h3";

const DOLI_URL = process.env.DOLI_URL || "http://dolibarr.localhost/api/index.php";
const DOLI_KEY = process.env.DOLI_KEY || "super_api_key";

export default eventHandler(async (event) => {
  const method = getMethod(event);
  const path = event.context.params?.path || [];
  const targetUrl = `${DOLI_URL}/${Array.isArray(path) ? path.join('/') : path}`;

  const body = method !== "GET" ? await readBody(event) : undefined;

  try {
    const data = await ofetch(targetUrl, {
      method,
      headers: {
        "DOLAPIKEY": DOLI_KEY,
        "Content-Type": "application/json"
      },
      body
    });
    return data;
  } catch (err: any) {
    setResponseStatus(event, 500);
    return { error: err.message };
  }
});
