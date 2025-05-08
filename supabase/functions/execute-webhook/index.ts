import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface WebhookRequest {
  url: string
  method: string
  headers: Record<string, string>
  payload?: string
}

interface ErrorResponse {
  error: string
  details?: string
  status?: number
}

serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Validate request
    if (!req.body) {
      throw new Error('Request body is required')
    }

    const { url, method, headers, payload } = await req.json() as WebhookRequest

    if (!url) {
      throw new Error('URL is required')
    }

    if (!method) {
      throw new Error('Method is required')
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
        responseData = await response.text()
      }
    } catch (error) {
      responseData = await response.text()
    }

    // Return the response with proper headers
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
          ...corsHeaders
        }
      }
    )
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: error.message || 'Unknown error occurred',
      status: 500
    }

    if (error.cause) {
      errorResponse.details = error.cause.message
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: errorResponse.status || 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})