import { eventHandler, readBody } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";

/**
 * Model Context Protocol JSON-RPC 2.0 request interface
 */
interface MCPRequest {
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: "2.0";
  /** Method name to execute */
  method: string;
  /** Optional parameters for the method */
  params?: any;
  /** Request identifier for response correlation */
  id: string | number | null;
}

/**
 * Main MCP endpoint handler implementing JSON-RPC 2.0 protocol
 *
 * Supports the following MCP methods:
 * - initialize: Initialize the MCP server connection
 * - tools/list: List available Dolibarr tools
 * - tools/call: Execute Dolibarr API tools
 *
 * @param event - H3 event object containing the request
 * @returns JSON-RPC 2.0 compliant response
 */
export default eventHandler(async (event) => {
  console.log("Received MCP request");

  const config = useRuntimeConfig();
  
  try {
    const body: MCPRequest = await readBody(event);

    if (!body.jsonrpc || body.jsonrpc !== "2.0") {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request - Missing or invalid jsonrpc version",
        },
        id: body.id || null,
      };
    }

    switch (body.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "Dolibarr MCP Server",
              version: "1.0.0",
            },
          },
          id: body.id,
        };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          result: {
            tools: [
              {
                name: "dolibarr_get",
                description: "Fetch data from Dolibarr API using GET method",
                inputSchema: {
                  type: "object",
                  properties: {
                    endpoint: {
                      type: "string",
                      description:
                        "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')",
                    },
                    id: {
                      type: "string",
                      description: "Optional ID for specific resource",
                    },
                    params: {
                      type: "object",
                      description: "Optional query parameters",
                      additionalProperties: true,
                    },
                  },
                  required: ["endpoint"],
                },
              },
              {
                name: "dolibarr_post",
                description:
                  "Create new data in Dolibarr API using POST method",
                inputSchema: {
                  type: "object",
                  properties: {
                    endpoint: {
                      type: "string",
                      description:
                        "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')",
                    },
                    data: {
                      type: "object",
                      description: "Data to create",
                      additionalProperties: true,
                    },
                  },
                  required: ["endpoint", "data"],
                },
              },
              {
                name: "dolibarr_put",
                description:
                  "Update existing data in Dolibarr API using PUT method",
                inputSchema: {
                  type: "object",
                  properties: {
                    endpoint: {
                      type: "string",
                      description:
                        "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')",
                    },
                    id: {
                      type: "string",
                      description: "ID of the resource to update",
                    },
                    data: {
                      type: "object",
                      description: "Data to update",
                      additionalProperties: true,
                    },
                  },
                  required: ["endpoint", "id", "data"],
                },
              },
              {
                name: "dolibarr_delete",
                description:
                  "Delete data from Dolibarr API using DELETE method",
                inputSchema: {
                  type: "object",
                  properties: {
                    endpoint: {
                      type: "string",
                      description:
                        "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')",
                    },
                    id: {
                      type: "string",
                      description: "ID of the resource to delete",
                    },
                  },
                  required: ["endpoint", "id"],
                },
              },
            ],
          },
          id: body.id,
        };

      case "tools/call":
        return await handleToolCall(body.params, body.id, config);

      default:
        return {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Method not found: ${body.method}`,
          },
          id: body.id,
        };
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal error",
        data: error.message,
      },
      id: null,
    };
  }
});

/**
 * Handle MCP tool call execution
 *
 * @param params - Tool call parameters containing name and arguments
 * @param requestId - Request ID for response correlation
 * @param config - Runtime configuration object
 * @returns JSON-RPC 2.0 response with tool execution result
 */
async function handleToolCall(params: any, requestId: string | number | null, config: any) {
  try {
    const { name, arguments: args } = params;

    switch (name) {
      case "dolibarr_get":
        return await handleDolibarrGet(args, requestId, config);
      case "dolibarr_post":
        return await handleDolibarrPost(args, requestId, config);
      case "dolibarr_put":
        return await handleDolibarrPut(args, requestId, config);
      case "dolibarr_delete":
        return await handleDolibarrDelete(args, requestId, config);
      default:
        return {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Tool not found: ${name}`,
          },
          id: requestId,
        };
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Tool execution error",
        data: error.message,
      },
      id: requestId,
    };
  }
}

/**
 * Handle Dolibarr GET API calls
 *
 * @param args - Arguments containing endpoint, optional id, and query params
 * @param requestId - Request ID for response correlation
 * @param config - Runtime configuration object
 * @returns JSON-RPC 2.0 response with API data
 */
async function handleDolibarrGet(args: any, requestId: string | number | null, config: any) {
  try {
    const { endpoint, id, params } = args;

    if (!endpoint) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint is required",
        },
        id: requestId,
      };
    }

    let url = `${config.doliUrl}/${endpoint}`;
    if (id) {
      url += `/${id}`;
    }

    const queryParams = new URLSearchParams(params || {});
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const data = await $fetch(url, {
      method: "GET",
      headers: {
        DOLAPIKEY: config.doliKey,
        "Content-Type": "application/json",
      },
    });

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      },
      id: requestId,
    };
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message,
      },
      id: requestId,
    };
  }
}

/**
 * Handle Dolibarr POST API calls to create new resources
 *
 * @param args - Arguments containing endpoint and data to create
 * @param requestId - Request ID for response correlation
 * @param config - Runtime configuration object
 * @returns JSON-RPC 2.0 response with creation result
 */
async function handleDolibarrPost(
  args: any,
  requestId: string | number | null,
  config: any
) {
  try {
    const { endpoint, data } = args;

    if (!endpoint || !data) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint and data are required",
        },
        id: requestId,
      };
    }

    const url = `${config.doliUrl}/${endpoint}`;

    const result = await $fetch(url, {
      method: "POST",
      headers: {
        DOLAPIKEY: config.doliKey,
        "Content-Type": "application/json",
      },
      body: data,
    });

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      },
      id: requestId,
    };
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message,
      },
      id: requestId,
    };
  }
}

/**
 * Handle Dolibarr PUT API calls to update existing resources
 *
 * @param args - Arguments containing endpoint, id, and data to update
 * @param requestId - Request ID for response correlation
 * @param config - Runtime configuration object
 * @returns JSON-RPC 2.0 response with update result
 */
async function handleDolibarrPut(args: any, requestId: string | number | null, config: any) {
  try {
    const { endpoint, id, data } = args;

    if (!endpoint || !id || !data) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint, id, and data are required",
        },
        id: requestId,
      };
    }

    const url = `${config.doliUrl}/${endpoint}/${id}`;

    const result = await $fetch(url, {
      method: "PUT",
      headers: {
        DOLAPIKEY: config.doliKey,
        "Content-Type": "application/json",
      },
      body: data,
    });

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      },
      id: requestId,
    };
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message,
      },
      id: requestId,
    };
  }
}

/**
 * Handle Dolibarr DELETE API calls to remove resources
 *
 * @param args - Arguments containing endpoint and id to delete
 * @param requestId - Request ID for response correlation
 * @param config - Runtime configuration object
 * @returns JSON-RPC 2.0 response with deletion result
 */
async function handleDolibarrDelete(
  args: any,
  requestId: string | number | null,
  config: any
) {
  try {
    const { endpoint, id } = args;

    if (!endpoint || !id) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint and id are required",
        },
        id: requestId,
      };
    }

    const url = `${config.doliUrl}/${endpoint}/${id}`;

    const result = await $fetch(url, {
      method: "DELETE",
      headers: {
        DOLAPIKEY: config.doliKey,
        "Content-Type": "application/json",
      },
    });

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      },
      id: requestId,
    };
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message,
      },
      id: requestId,
    };
  }
}
