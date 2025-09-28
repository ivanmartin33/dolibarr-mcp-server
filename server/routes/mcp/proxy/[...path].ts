
import { readBody, setResponseStatus, eventHandler } from "h3";
import {useRuntimeConfig} from "nitropack/runtime";

export default eventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const method = event.method
  const path = event.context.params?.path || [];
  const targetUrl = `${config.doliUrl}/${Array.isArray(path) ? path.join('/') : path}`;

  const body = method !== "GET" ? await readBody(event) : undefined;

  try {
    const data = await $fetch(targetUrl, {
      method,
      headers: {
        "DOLAPIKEY": config.doliKey,
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
