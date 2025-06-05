// Telegram Bot Configuration
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  CHAT_ID: process.env.TELEGRAM_CHAT_ID
};

// Other app configurations
export const APP_CONFIG = {
  SESSION_SECRET: process.env.SESSION_SECRET || "instaboost-secret-key-2024",
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development"
};