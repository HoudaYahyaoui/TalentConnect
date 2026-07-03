/**
 * JWT Token Models - Gestion des tokens JWT
 */

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  iat: number; // Issued at
  exp: number; // Expiration
  aud?: string; // Audience
  iss?: string; // Issuer
}

export interface JwtToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string; // 'Bearer'
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
}
