import { eventHandler, readBody } from "h3"

/**
 * MCP server description endpoint
 * 
 * Provides server information via HTTP GET and handles JSON-RPC MCP methods via POST.
 * This endpoint is mainly for compatibility and debugging purposes.
 * The main MCP endpoint is /mcp/index.ts
 * 
 * @param event - H3 event object containing the request
 * @returns Server description or JSON-RPC response
 */
export default eventHandler(async (event) => {
  const method = event.method
  
  if (method === "GET") {
    return {
      name: "Dolibarr MCP Server",
      version: "1.0.0",
      description: "MCP Server providing access to Dolibarr ERP/CRM API endpoints",
      tools: [
        {
          name: "dolibarr_get",
          description: "Fetch data from Dolibarr API using GET method",
          inputSchema: {
            type: "object",
            properties: {
              endpoint: { 
                type: "string", 
                description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
              },
              id: { 
                type: "string", 
                description: "Optional ID for specific resource" 
              },
              params: { 
                type: "object", 
                description: "Optional query parameters",
                additionalProperties: true 
              }
            },
            required: ["endpoint"]
          }
        },
        {
          name: "dolibarr_post",
          description: "Create new data in Dolibarr API using POST method",
          inputSchema: {
            type: "object",
            properties: {
              endpoint: { 
                type: "string", 
                description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
              },
              data: { 
                type: "object", 
                description: "Data to create",
                additionalProperties: true 
              }
            },
            required: ["endpoint", "data"]
          }
        },
        {
          name: "dolibarr_put", 
          description: "Update existing data in Dolibarr API using PUT method",
          inputSchema: {
            type: "object",
            properties: {
              endpoint: { 
                type: "string", 
                description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
              },
              id: { 
                type: "string", 
                description: "ID of the resource to update" 
              },
              data: { 
                type: "object", 
                description: "Data to update",
                additionalProperties: true 
              }
            },
            required: ["endpoint", "id", "data"]
          }
        },
        {
          name: "dolibarr_delete",
          description: "Delete data from Dolibarr API using DELETE method", 
          inputSchema: {
            type: "object",
            properties: {
              endpoint: { 
                type: "string", 
                description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
              },
              id: { 
                type: "string", 
                description: "ID of the resource to delete" 
              }
            },
            required: ["endpoint", "id"]
          }
        }
      ]
    }
  }
  
  if (method === "POST") {
    const body = await readBody(event)
    
    if (!body.jsonrpc || body.jsonrpc !== "2.0") {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request - Missing or invalid jsonrpc version"
        },
        id: body.id || null
      }
    }
    
    switch (body.method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: "Dolibarr MCP Server",
              version: "1.0.0"
            }
          },
          id: body.id
        }
        
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
                      description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
                    },
                    id: { 
                      type: "string", 
                      description: "Optional ID for specific resource" 
                    },
                    params: { 
                      type: "object", 
                      description: "Optional query parameters",
                      additionalProperties: true 
                    }
                  },
                  required: ["endpoint"]
                }
              },
              {
                name: "dolibarr_post",
                description: "Create new data in Dolibarr API using POST method",
                inputSchema: {
                  type: "object",
                  properties: {
                    endpoint: { 
                      type: "string", 
                      description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
                    },
                    data: { 
                      type: "object", 
                      description: "Data to create",
                      additionalProperties: true 
                    }
                  },
                  required: ["endpoint", "data"]
                }
              },
              {
                name: "dolibarr_put", 
                description: "Update existing data in Dolibarr API using PUT method",
                inputSchema: {
                  type: "object",
                  properties: {
                    endpoint: { 
                      type: "string", 
                      description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
                    },
                    id: { 
                      type: "string", 
                      description: "ID of the resource to update" 
                    },
                    data: { 
                      type: "object", 
                      description: "Data to update",
                      additionalProperties: true 
                    }
                  },
                  required: ["endpoint", "id", "data"]
                }
              },
              {
                name: "dolibarr_delete",
                description: "Delete data from Dolibarr API using DELETE method", 
                inputSchema: {
                  type: "object",
                  properties: {
                    endpoint: { 
                      type: "string", 
                      description: "Dolibarr API endpoint (e.g., 'thirdparties', 'products', 'invoices')" 
                    },
                    id: { 
                      type: "string", 
                      description: "ID of the resource to delete" 
                    }
                  },
                  required: ["endpoint", "id"]
                }
              }
            ]
          },
          id: body.id
        }
        
      default:
        return {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Method not found: ${body.method}`
          },
          id: body.id
        }
    }
  }
  
  return {
    jsonrpc: "2.0",
    error: {
      code: -32600,
      message: "Invalid Request - Method not allowed"
    },
    id: null
  }
});
