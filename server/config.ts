// Telegram Bot Configuration
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "7275717734:AAE6bq0Mdypn_wQL6F1wpphzEtLAco3_B3Y",
  CHAT_ID: process.env.TELEGRAM_CHAT_ID || "6881713177"
};

// Other app configurations
export const APP_CONFIG = {
  SESSION_SECRET: process.env.JWT_SECRET || process.env.SESSION_SECRET || "SomeVeryStrongRandomSecret",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development"
};