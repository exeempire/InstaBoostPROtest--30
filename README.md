# SMM Panel - Social Media Marketing Dashboard

A sophisticated Social Media Marketing (SMM) panel for managing services, orders, payments, and user accounts.

## Features

- User authentication and dashboard
- Service catalog with ordering system
- Wallet management and payment processing
- Order tracking and management
- Telegram integration for notifications
- Responsive design

## Technology Stack

- **Frontend**: React.js with TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based auth
- **Payments**: Manual payment processing
- **Notifications**: Telegram Bot integration

## Deployment Options

### Option 1: Render (Recommended for Free Hosting)

1. Create account on [Render.com](https://render.com)
2. Connect your GitHub repository
3. Use the included `render.yaml` for automatic deployment
4. Set environment variables in Render dashboard

### Option 2: Railway

1. Sign up at [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy with automatic PostgreSQL database
4. Configure environment variables

### Option 3: Vercel + PlanetScale

1. Deploy frontend on Vercel
2. Use serverless functions for API
3. Database on PlanetScale

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secret-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
PORT=5000
NODE_ENV=production
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up database:
```bash
npm run db:push
```

3. Start development server:
```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```

## Database Migrations

Use Drizzle Kit for schema changes:
```bash
npm run db:push
```

## Support

For hosting support, contact your hosting provider's documentation or support team.