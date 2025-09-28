import { eventHandler, readBody } from "h3"
import { ofetch } from "ofetch"

/**
 * Dolibarr API base URL from environment variable
 * @default "http://dolibarr.localhost/api/index.php"
 */
const DOLI_URL = process.env.DOLI_URL || "http://dolibarr.localhost/api/index.php"

/**
 * Dolibarr API key from environment variable
 * @default "super_api_key"
 */
const DOLI_KEY = process.env.DOLI_KEY || "super_api_key"

/**
 * MCP tool call request interface
 */
interface MCPToolCallRequest {
  /** JSON-RPC version, must be "2.0" */
  jsonrpc: "2.0"
  /** Method name, must be "tools/call" */
  method: "tools/call"
  /** Tool call parameters */
  params: {
    /** Name of the tool to execute */
    name: string
    /** Arguments to pass to the tool */
    arguments: Record<string, any>
  }
  /** Request identifier */
  id: string | number
}

/**
 * Direct tool call endpoint for MCP tools
 * 
 * This endpoint provides a direct way to call Dolibarr tools without going through
 * the main MCP endpoint. Useful for testing and direct integrations.
 * 
 * @param event - H3 event object containing the request
 * @returns JSON-RPC 2.0 response with tool execution result
 */
export default eventHandler(async (event) => {
  try {
    const body: MCPToolCallRequest = await readBody(event)
    
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

    if (body.method !== "tools/call") {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32601,
          message: `Method not found: ${body.method}`
        },
        id: body.id
      }
    }

    const { name, arguments: args } = body.params

    switch (name) {
      case "dolibarr_get":
        return await handleDolibarrGet(args, body.id)
      case "dolibarr_post":
        return await handleDolibarrPost(args, body.id)
      case "dolibarr_put":
        return await handleDolibarrPut(args, body.id)
      case "dolibarr_delete":
        return await handleDolibarrDelete(args, body.id)
      default:
        return {
          jsonrpc: "2.0",
          error: {
            code: -32601,
            message: `Tool not found: ${name}`
          },
          id: body.id
        }
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Internal error",
        data: error.message
      },
      id: null
    }
  }
})

async function handleDolibarrGet(args: any, requestId: string | number) {
  try {
    const { endpoint, id, params } = args
    
    if (!endpoint) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint is required"
        },
        id: requestId
      }
    }

    let url = `${DOLI_URL}/${endpoint}`
    if (id) {
      url += `/${id}`
    }

    const queryParams = new URLSearchParams(params || {})
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }

    const data = await ofetch(url, {
      method: "GET",
      headers: {
        "DOLAPIKEY": DOLI_KEY,
        "Content-Type": "application/json"
      }
    })

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      },
      id: requestId
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message
      },
      id: requestId
    }
  }
}

async function handleDolibarrPost(args: any, requestId: string | number) {
  try {
    const { endpoint, data } = args
    
    if (!endpoint || !data) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint and data are required"
        },
        id: requestId
      }
    }

    const url = `${DOLI_URL}/${endpoint}`

    const result = await ofetch(url, {
      method: "POST",
      headers: {
        "DOLAPIKEY": DOLI_KEY,
        "Content-Type": "application/json"
      },
      body: data
    })

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      },
      id: requestId
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message
      },
      id: requestId
    }
  }
}

async function handleDolibarrPut(args: any, requestId: string | number) {
  try {
    const { endpoint, id, data } = args
    
    if (!endpoint || !id || !data) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint, id, and data are required"
        },
        id: requestId
      }
    }

    const url = `${DOLI_URL}/${endpoint}/${id}`

    const result = await ofetch(url, {
      method: "PUT",
      headers: {
        "DOLAPIKEY": DOLI_KEY,
        "Content-Type": "application/json"
      },
      body: data
    })

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      },
      id: requestId
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message
      },
      id: requestId
    }
  }
}

async function handleDolibarrDelete(args: any, requestId: string | number) {
  try {
    const { endpoint, id } = args
    
    if (!endpoint || !id) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32602,
          message: "Invalid params - endpoint and id are required"
        },
        id: requestId
      }
    }

    const url = `${DOLI_URL}/${endpoint}/${id}`

    const result = await ofetch(url, {
      method: "DELETE",
      headers: {
        "DOLAPIKEY": DOLI_KEY,
        "Content-Type": "application/json"
      }
    })

    return {
      jsonrpc: "2.0",
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      },
      id: requestId
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Dolibarr API error",
        data: error.message
      },
      id: requestId
    }
  }
}