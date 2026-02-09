import type { APIRoute } from 'astro'

export const prerender = false

const APPS_API = 'https://apps.jbcloud.app/api'

export const GET: APIRoute = async () => {
  const token = import.meta.env.APPS_API_TOKEN

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${APPS_API}/applications`, { headers })

    if (!response.ok) {
      throw new Error(`Apps API responded with ${response.status}`)
    }

    const json = await response.json()
    const applications = json.applications ?? []

    return new Response(
      JSON.stringify({ success: true, data: applications }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Apps API error'
    return new Response(
      JSON.stringify({ success: false, error: message, data: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
