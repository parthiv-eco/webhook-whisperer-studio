import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface WebhookRequest {
  url: string
  method: string
  headers: Record<string, string>
  payload?: string
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    const { url, method, headers, payload } = await req.json() as WebhookRequest

    if (!url) {
      throw new Error('URL is required')
    }

    // Execute the webhook
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method !== 'GET' ? payload : undefined
    })

    // Get response data based on content type
    let responseData: any
    const contentType = response.headers.get('content-type')
    
    try {
      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        // For non-JSON responses, get text content
        responseData = await response.text()
      }
    } catch (error) {
      // If parsing fails, get the raw text
      responseData = await response.text()
    }

    // Return the response
    return new Response(
      JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})