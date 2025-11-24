import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the credential server URL
 * Priority: 1. Environment variable 2. Localhost (for local dev) 3. Production fallback
 */
export function getCredentialServerUrl(): string {
  // If explicitly set in env, use that
  if (process.env.NEXT_PUBLIC_CREDENTIAL_SERVER_URL) {
    return process.env.NEXT_PUBLIC_CREDENTIAL_SERVER_URL;
  }
  
  // Default to localhost:3001 for local development
  // This makes it easier to work with local Docker services
  return "http://localhost:3001";
}
