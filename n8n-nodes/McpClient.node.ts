import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class McpClient implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MCP Client',
		name: 'mcpClient',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Model Context Protocol (MCP) servers',
		defaults: {
			name: 'MCP Client',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		properties: [
			{
				displayName: 'MCP Server URL',
				name: 'serverUrl',
				type: 'string',
				default: 'http://localhost:3000/mcp',
				required: true,
				description: 'Base URL of the MCP server',
				placeholder: 'http://localhost:3000/mcp',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Tools',
						value: 'tools',
					},
				],
				default: 'tools',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['tools'],
					},
				},
				options: [
					{
						name: 'List Available Tools',
						value: 'listTools',
						description: 'Get all available MCP tools from the server',
						action: 'List all available MCP tools',
					},
					{
						name: 'Execute Tool',
						value: 'executeTool',
						description: 'Execute a specific MCP tool',
						action: 'Execute an MCP tool',
					},
				],
				default: 'listTools',
			},
			{
				displayName: 'Tool Name',
				name: 'toolName',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAvailableTools',
				},
				displayOptions: {
					show: {
						resource: ['tools'],
						operation: ['executeTool'],
					},
				},
				default: '',
				required: true,
				description: 'Choose the tool to execute',
			},
			{
				displayName: 'Tool Arguments',
				name: 'toolArguments',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['tools'],
						operation: ['executeTool'],
					},
				},
				default: '{}',
				description: 'Arguments to pass to the tool (JSON format)',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	};

	methods = {
		loadOptions: {
			async getAvailableTools(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const serverUrl = this.getNodeParameter('serverUrl') as string;
				
				try {
					const response = await this.helpers.httpRequest({
						method: 'POST',
						url: serverUrl,
						body: {
							jsonrpc: '2.0',
							method: 'tools/list',
							params: {},
							id: 1,
						},
						json: true,
					});
					
					if (response.error) {
						throw new NodeOperationError(this.getNode(), `MCP Server Error: ${response.error.message}`);
					}

					const tools = response.result?.tools || [];
					
					return tools.map((tool: any) => ({
						name: tool.name,
						value: tool.name,
						description: tool.description,
					}));
				} catch (error) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					throw new NodeOperationError(this.getNode(), `Failed to fetch available tools: ${errorMessage}`);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const serverUrl = this.getNodeParameter('serverUrl', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				if (resource === 'tools') {
					if (operation === 'listTools') {
						// List available tools
						const response = await this.helpers.httpRequest({
							method: 'POST',
							url: serverUrl,
							body: {
								jsonrpc: '2.0',
								method: 'tools/list',
								params: {},
								id: i + 1,
							},
							json: true,
						});
						
						if (response.error) {
							throw new NodeOperationError(this.getNode(), `MCP Server Error: ${response.error.message}`);
						}

						responseData = response.result;

					} else if (operation === 'executeTool') {
						// Execute a specific tool
						const toolName = this.getNodeParameter('toolName', i) as string;
						const toolArgumentsStr = this.getNodeParameter('toolArguments', i) as string;
						
						let toolArguments;
						try {
							toolArguments = JSON.parse(toolArgumentsStr);
						} catch (error) {
							const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
							throw new NodeOperationError(this.getNode(), `Invalid JSON in tool arguments: ${errorMessage}`);
						}

						const response = await this.helpers.httpRequest({
							method: 'POST',
							url: serverUrl,
							body: {
								jsonrpc: '2.0',
								method: 'tools/call',
								params: {
									name: toolName,
									arguments: toolArguments,
								},
								id: i + 1,
							},
							json: true,
						});
						
						if (response.error) {
							throw new NodeOperationError(this.getNode(), `MCP Server Error: ${response.error.message}`);
						}

						responseData = response.result;
					}
				}

				returnData.push({
					json: responseData,
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error occurred',
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}