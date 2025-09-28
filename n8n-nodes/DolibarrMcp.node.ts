import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class DolibarrMcp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Dolibarr (MCP)',
		name: 'dolibarrMcp',
		icon: 'file:dolibarr.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["endpoint"]}}',
		description: 'Interact with Dolibarr ERP/CRM via MCP server',
		defaults: {
			name: 'Dolibarr (MCP)',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		properties: [
			{
				displayName: 'MCP Server URL',
				name: 'mcpServerUrl',
				type: 'string',
				default: 'http://localhost:3000/mcp',
				required: true,
				description: 'URL of the Dolibarr MCP server',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Fetch data from Dolibarr',
						action: 'Get data from Dolibarr',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create new data in Dolibarr',
						action: 'Create data in Dolibarr',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update existing data in Dolibarr',
						action: 'Update data in Dolibarr',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete data from Dolibarr',
						action: 'Delete data from Dolibarr',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Endpoint',
				name: 'endpoint',
				type: 'options',
				options: [
					{
						name: 'Third Parties (Customers/Suppliers)',
						value: 'thirdparties',
					},
					{
						name: 'Products',
						value: 'products',
					},
					{
						name: 'Users',
						value: 'users',
					},
					{
						name: 'Invoices',
						value: 'invoices',
					},
					{
						name: 'Orders',
						value: 'orders',
					},
					{
						name: 'Proposals',
						value: 'proposals',
					},
					{
						name: 'Contracts',
						value: 'contracts',
					},
					{
						name: 'Projects',
						value: 'projects',
					},
					{
						name: 'Custom Endpoint',
						value: 'custom',
					},
				],
				default: 'thirdparties',
				required: true,
				description: 'Dolibarr API endpoint to interact with',
			},
			{
				displayName: 'Custom Endpoint',
				name: 'customEndpoint',
				type: 'string',
				displayOptions: {
					show: {
						endpoint: ['custom'],
					},
				},
				default: '',
				required: true,
				description: 'Custom endpoint name',
			},
			{
				displayName: 'Resource ID',
				name: 'resourceId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'ID of the specific resource (optional for GET, required for UPDATE/DELETE)',
			},
			{
				displayName: 'Query Parameters',
				name: 'queryParams',
				type: 'fixedCollection',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				description: 'Query parameters for GET requests',
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				displayName: 'Data',
				name: 'data',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				default: '{}',
				required: true,
				description: 'Data to create or update (JSON format)',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const mcpServerUrl = this.getNodeParameter('mcpServerUrl', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const endpoint = this.getNodeParameter('endpoint', i) as string;
				const customEndpoint = this.getNodeParameter('customEndpoint', i, '') as string;
				const resourceId = this.getNodeParameter('resourceId', i, '') as string;

				// Determine the actual endpoint
				const actualEndpoint = endpoint === 'custom' ? customEndpoint : endpoint;

				// Build tool name and arguments based on operation
				let toolName: string;
				let toolArguments: any = {
					endpoint: actualEndpoint,
				};

				switch (operation) {
					case 'get':
						toolName = 'dolibarr_get';
						if (resourceId) {
							toolArguments.id = resourceId;
						}
						// Add query parameters
						const queryParams = this.getNodeParameter('queryParams', i, {}) as any;
						if (queryParams.parameter && queryParams.parameter.length > 0) {
							toolArguments.params = {};
							for (const param of queryParams.parameter) {
								if (param.name && param.value) {
									toolArguments.params[param.name] = param.value;
								}
							}
						}
						break;

					case 'create':
						toolName = 'dolibarr_post';
						const createDataStr = this.getNodeParameter('data', i) as string;
						try {
							toolArguments.data = JSON.parse(createDataStr);
						} catch (error) {
							throw new NodeOperationError(this.getNode(), `Invalid JSON in data field: ${error instanceof Error ? error.message : 'Unknown error'}`);
						}
						break;

					case 'update':
						toolName = 'dolibarr_put';
						if (!resourceId) {
							throw new NodeOperationError(this.getNode(), 'Resource ID is required for update operations');
						}
						toolArguments.id = resourceId;
						const updateDataStr = this.getNodeParameter('data', i) as string;
						try {
							toolArguments.data = JSON.parse(updateDataStr);
						} catch (error) {
							throw new NodeOperationError(this.getNode(), `Invalid JSON in data field: ${error instanceof Error ? error.message : 'Unknown error'}`);
						}
						break;

					case 'delete':
						toolName = 'dolibarr_delete';
						if (!resourceId) {
							throw new NodeOperationError(this.getNode(), 'Resource ID is required for delete operations');
						}
						toolArguments.id = resourceId;
						break;

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				// Make MCP request
				const mcpRequest = {
					jsonrpc: '2.0',
					method: 'tools/call',
					params: {
						name: toolName,
						arguments: toolArguments,
					},
					id: i + 1,
				};

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: mcpServerUrl,
					body: mcpRequest,
					json: true,
				});

				if (response.error) {
					throw new NodeOperationError(this.getNode(), `MCP Server Error: ${response.error.message}`);
				}

				returnData.push({
					json: response.result || response,
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