/**
 * Playwright-based fallback extractor.
 * Used when direct HTTP extraction fails (CF challenges, JS-rendered pages).
 * Falls back gracefully if playwright is not available.
 */
import { logger } from "../../logger.js";
import type { StreamSource } from "../types.js";

export async function extractViaPlaywright(
  embedUrl: string,
  providerName: string,
  skipData?: { intro?: [number, number]; outro?: [number, number] }
): Promise<StreamSource | null> {
  logger.warn(
    { embedUrl: embedUrl.slice(0, 80), providerName },
    "[Playwright] fallback extractor called — this provider requires a headless browser"
  );
  // Playwright is not available in this environment
  return null;
}
