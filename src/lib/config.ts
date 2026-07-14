if (!process.env.KTOR_API_URL) {
  throw new Error("KTOR_API_URL is not set — add it to .env.local");
}

export const KTOR_URL = process.env.KTOR_API_URL;
