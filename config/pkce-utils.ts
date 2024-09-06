// pkce-util.ts
import { createHash, randomBytes } from 'crypto';

/**
 * Generate a code verifier (random string) and a code challenge (derived from code verifier)
 * @returns { codeVerifier: string, codeChallenge: string }
 */
export function generatePKCE(): { codeVerifier: string, codeChallenge: string } {
  // Generate a random string (code verifier) with 128 characters
  const codeVerifier = randomBytes(64).toString('base64url');
  
  // Create a code challenge by hashing the code verifier using SHA-256
  const codeChallenge = base64UrlEncode(createHash('sha256').update(codeVerifier).digest('base64'));

  return { codeVerifier, codeChallenge };
}

/**
 * Base64 URL encoding for code challenge (replaces +, / with - and _)
 */
function base64UrlEncode(str: string): string {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
