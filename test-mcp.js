/**
 * Test script for MCP endpoints
 * Run with: node test-mcp.js
 */

const baseUrl = 'http://localhost:3000'

async function testMCPEndpoint() {
  console.log('🧪 Testing MCP Server endpoints...\n')

  // Test 1: Initialize
  console.log('1️⃣ Testing initialize...')
  try {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {},
        id: 1
      })
    })
    const result = await response.json()
    console.log('✅ Initialize successful:', result.result?.serverInfo?.name)
  } catch (error) {
    console.error('❌ Initialize failed:', error.message)
  }

  // Test 2: Tools list
  console.log('\n2️⃣ Testing tools/list...')
  try {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 2
      })
    })
    const result = await response.json()
    console.log('✅ Tools list successful:', result.result?.tools?.length, 'tools found')
    result.result?.tools?.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`)
    })
  } catch (error) {
    console.error('❌ Tools list failed:', error.message)
  }

  // Test 3: Describe endpoint
  console.log('\n3️⃣ Testing describe endpoint...')
  try {
    const response = await fetch(`${baseUrl}/mcp/describe`)
    const result = await response.json()
    console.log('✅ Describe successful:', result.name)
  } catch (error) {
    console.error('❌ Describe failed:', error.message)
  }

  // Test 4: Tool call (this will likely fail without valid Dolibarr config)
  console.log('\n4️⃣ Testing tool call (may fail without Dolibarr config)...')
  try {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'dolibarr_get',
          arguments: {
            endpoint: 'users'
          }
        },
        id: 4
      })
    })
    const result = await response.json()
    if (result.error) {
      console.log('⚠️ Tool call failed (expected):', result.error.message)
      console.log('   Data:', result.error.data)
    } else {
      console.log('✅ Tool call successful!')
    }
  } catch (error) {
    console.error('❌ Tool call failed:', error.message)
  }

  console.log('\n🏁 Test completed!')
}

// Run tests
testMCPEndpoint().catch(console.error)