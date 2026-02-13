import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'
import { validateId, createErrorResponse, createSuccessResponse } from '@/lib/validation'

export const prerender = false

export const POST: APIRoute = async ({ params, request }) => {
  const { appId } = params

  // Validate appId from URL params
  const appIdValidation = validateId(appId, 'appId')
  if (!appIdValidation.valid) {
    return createErrorResponse(
      new Error(appIdValidation.error || 'Invalid appId'),
      'Invalid appId',
      400
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return createErrorResponse(
      new Error('Invalid JSON'),
      'Invalid request body',
      400
    )
  }

  const { itemId } = body

  // Validate itemId from request body
  const itemIdValidation = validateId(itemId, 'itemId')
  if (!itemIdValidation.valid) {
    return createErrorResponse(
      new Error(itemIdValidation.error || 'Invalid itemId'),
      'Invalid itemId',
      400
    )
  }

  try {
    const db = await ensureDb()

    await db.execute({
      sql: `INSERT OR IGNORE INTO app_connections (app_id, item_id)
            VALUES (?, ?)`,
      args: [appIdValidation.sanitized, itemIdValidation.sanitized],
    })

    return createSuccessResponse(null, 201)
  } catch (error) {
    return createErrorResponse(error, 'Failed to create connection')
  }
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const { appId } = params

  // Validate appId from URL params
  const appIdValidation = validateId(appId, 'appId')
  if (!appIdValidation.valid) {
    return createErrorResponse(
      new Error(appIdValidation.error || 'Invalid appId'),
      'Invalid appId',
      400
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return createErrorResponse(
      new Error('Invalid JSON'),
      'Invalid request body',
      400
    )
  }

  const { itemId } = body

  // Validate itemId from request body
  const itemIdValidation = validateId(itemId, 'itemId')
  if (!itemIdValidation.valid) {
    return createErrorResponse(
      new Error(itemIdValidation.error || 'Invalid itemId'),
      'Invalid itemId',
      400
    )
  }

  try {
    const db = await ensureDb()

    await db.execute({
      sql: 'DELETE FROM app_connections WHERE app_id = ? AND item_id = ?',
      args: [appIdValidation.sanitized, itemIdValidation.sanitized],
    })

    return createSuccessResponse(null)
  } catch (error) {
    return createErrorResponse(error, 'Failed to delete connection')
  }
}
