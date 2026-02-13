/**
 * Rate limiter for GitHub API calls
 * Tracks remaining requests and enforces rate limits
 */

interface RateLimitState {
  remaining: number
  resetTime: number
  limit: number
}

class GitHubRateLimiter {
  private state: RateLimitState = {
    remaining: 5000,
    resetTime: Date.now() + 3600000, // 1 hour from now
    limit: 5000,
  }

  /**
   * Update rate limit state from response headers
   */
  updateFromHeaders(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining')
    const reset = headers.get('X-RateLimit-Reset')
    const limit = headers.get('X-RateLimit-Limit')

    if (remaining) {
      this.state.remaining = parseInt(remaining, 10)
    }
    if (reset) {
      this.state.resetTime = parseInt(reset, 10) * 1000 // Convert to ms
    }
    if (limit) {
      this.state.limit = parseInt(limit, 10)
    }
  }

  /**
   * Check if we're currently rate limited
   */
  isRateLimited(): boolean {
    if (this.state.remaining <= 0 && Date.now() < this.state.resetTime) {
      return true
    }

    // Reset if we've passed the reset time
    if (Date.now() >= this.state.resetTime) {
      this.state.remaining = this.state.limit
      this.state.resetTime = Date.now() + 3600000
    }

    return false
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   */
  getTimeUntilReset(): number {
    return Math.max(0, this.state.resetTime - Date.now())
  }

  /**
   * Get current rate limit state
   */
  getState(): Readonly<RateLimitState> {
    return { ...this.state }
  }

  /**
   * Fetch with rate limit checking
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Check if we're rate limited
    if (this.isRateLimited()) {
      const waitTime = this.getTimeUntilReset()
      throw new Error(
        `GitHub API rate limit exceeded. Retry after ${Math.ceil(waitTime / 1000)}s`
      )
    }

    // Make the request
    const response = await fetch(url, options)

    // Update rate limit state from response headers
    this.updateFromHeaders(response.headers)

    // Check for 429 status
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const waitTime = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : this.getTimeUntilReset()

      throw new Error(
        `GitHub API rate limit exceeded (429). Retry after ${Math.ceil(waitTime / 1000)}s`
      )
    }

    // Check for 403 with rate limit message
    if (response.status === 403) {
      const body = await response.text()
      if (body.includes('rate limit')) {
        const waitTime = this.getTimeUntilReset()
        throw new Error(
          `GitHub API rate limit exceeded (403). Retry after ${Math.ceil(waitTime / 1000)}s`
        )
      }
      // Re-create response for further processing
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    }

    return response
  }

  /**
   * Fetch with automatic retry on rate limit
   */
  async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries = 3
  ): Promise<Response> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.fetch(url, options)
      } catch (error) {
        if (error instanceof Error && error.message.includes('rate limit')) {
          lastError = error

          // Extract wait time from error message
          const match = error.message.match(/Retry after (\d+)s/)
          const waitSeconds = match ? parseInt(match[1], 10) : 60

          // Wait before retrying (with exponential backoff)
          const backoffMs = Math.min(waitSeconds * 1000 * Math.pow(2, attempt), 300000) // Max 5 minutes
          console.log(`Rate limited. Waiting ${Math.ceil(backoffMs / 1000)}s before retry ${attempt + 1}/${maxRetries}`)

          await new Promise(resolve => setTimeout(resolve, backoffMs))
        } else {
          // Not a rate limit error, rethrow immediately
          throw error
        }
      }
    }

    // All retries exhausted
    throw lastError || new Error('Max retries reached')
  }
}

// Singleton instance
export const githubRateLimiter = new GitHubRateLimiter()
