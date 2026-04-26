/**
 * Authentication and authorization types.
 *
 * @module auth.types
 */

/** Credentials submitted on the login form. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Payload submitted on the registration form. */
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

/** Response returned after a successful login or token refresh. */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenId: string;
  sessionId: string;
}

/** Body of a token-refresh request. */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Minimal user payload embedded in the JWT / request context. */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  permissions?: string[];
}

/** Pair of tokens stored client-side. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
