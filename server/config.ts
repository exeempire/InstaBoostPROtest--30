// Telegram Bot Configuration
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  CHAT_ID: process.env.TELEGRAM_CHAT_ID || ""
};

// Other app configurations
export const APP_CONFIG = {
  SESSION_SECRET: process.env.JWT_SECRET || process.env.SESSION_SECRET || "DefaultSecretKeyForDevelopmentOnly_ChangeInProduction_123456789",
  PORT: process.env.PORT || 10000,
  NODE_ENV: process.env.NODE_ENV || "development"
};