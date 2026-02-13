import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'
import {
  validateGitHubName,
  validateBoolean,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/validation'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
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

  const { repoName, owner, active } = body

  // Validate repoName
  const repoNameValidation = validateGitHubName(repoName, 'repoName')
  if (!repoNameValidation.valid) {
    return createErrorResponse(
      new Error(repoNameValidation.error || 'Invalid repoName'),
      'Invalid repoName',
      400
    )
  }

  // Validate owner
  const ownerValidation = validateGitHubName(owner, 'owner')
  if (!ownerValidation.valid) {
    return createErrorResponse(
      new Error(ownerValidation.error || 'Invalid owner'),
      'Invalid owner',
      400
    )
  }

  // Validate active
  const activeValidation = validateBoolean(active, 'active')
  if (!activeValidation.valid) {
    return createErrorResponse(
      new Error(activeValidation.error || 'Invalid active'),
      'Invalid active value',
      400
    )
  }

  try {
    const db = await ensureDb()

    await db.execute({
      sql: `INSERT INTO user_repos (repo_name, owner, active, activated_at)
            VALUES (?, ?, ?, CASE WHEN ? THEN datetime('now') ELSE NULL END)
            ON CONFLICT(repo_name) DO UPDATE SET
              active = excluded.active,
              activated_at = excluded.activated_at`,
      args: [
        repoNameValidation.sanitized,
        ownerValidation.sanitized,
        active ? 1 : 0,
        active ? 1 : 0,
      ],
    })

    return createSuccessResponse({
      repoName: repoNameValidation.sanitized,
      active,
    })
  } catch (error) {
    return createErrorResponse(error, 'Failed to toggle repository')
  }
}
