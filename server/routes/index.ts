import { eventHandler } from "h3"

export default eventHandler((event) => {
  return { message: "Dolibarr MCP Server is running!" };
});
