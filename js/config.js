// Keys for the little travel helper.
// Heads up: this is a plain static site, so these keys are visible to anyone
// who opens devtools. That's fine for a personal page — just don't paste a
// billing-critical key here.
window.SANA_KEYS = {
  // Google AI Studio (free tier) — checked & working as of 23 Sep 2026
  gemini: "AQ.Ab8RN6KNS3AWxrtHCTJbntLEu1VpSI_uOAndECP4Apbc8YCovA",
  model: "gemini-3.6-flash", // 2.5-flash is closed to new keys now
  // OpenRouter — key is valid but the account has no credits, so this is
  // only a last-resort fallback until credits are added.
  openrouter: "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"
};
