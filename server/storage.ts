import { 
  users, 
  orders, 
  payments, 
  services,
  loginLogs,
  type User, 
  type InsertUser,
  type Order,
  type InsertOrder,
  type Payment,
  type InsertPayment,
  type Service,
  type InsertService,
  type LoginLog,
  type InsertLoginLog
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByInstagramUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<void>;
  markBonusClaimed(userId: number): Promise<void>;
  
  // Order operations
  createOrder(insertOrder: InsertOrder): Promise<Order>;
  getUserOrders(userId: number): Promise<Order[]>;
  
  // Payment operations
  createPayment(insertPayment: InsertPayment): Promise<Payment>;
  getUserPayments(userId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<void>;
  
  // Service operations
  getServices(): Promise<Service[]>;
  initializeServices(): Promise<void>;
  
  // Login tracking operations
  logUserLogin(userId: number, instagramUsername: string): Promise<number>;
  getUserLoginCount(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.instagramUsername, username));
    return user || undefined;
  }

  async getUserByInstagramUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.instagramUsername, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<void> {
    await db
      .update(users)
      .set({ walletBalance: newBalance.toString() })
      .where(eq(users.id, userId));
  }

  async markBonusClaimed(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ bonusClaimed: true })
      .where(eq(users.id, userId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(payments.createdAt);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async updatePaymentStatus(id: number, status: string): Promise<void> {
    await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id));
  }

  async getServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.active, true))
      .orderBy(services.category, services.name);
  }

  async initializeServices(): Promise<void> {
    // Check if services already exist
    const existingServices = await db.select().from(services);
    if (existingServices.length > 0) {
      return;
    }

    // Initialize default services
    const defaultServices: InsertService[] = [
      // Followers
      {
        name: "Instagram Followers - Indian",
        category: "Followers",
        rate: "4.00",
        minOrder: 100,
        maxOrder: 100000,
        deliveryTime: "0-2 hours",
        active: true,
      },
      {
        name: "Instagram Followers - USA",
        category: "Followers",
        rate: "5.00",
        minOrder: 100,
        maxOrder: 50000,
        deliveryTime: "0-4 hours",
        active: true,
      },
      {
        name: "Instagram Followers - Global",
        category: "Followers",
        rate: "3.50",
        minOrder: 100,
        maxOrder: 200000,
        deliveryTime: "0-6 hours",
        active: true,
      },
      // Likes
      {
        name: "Instagram Likes - Indian",
        category: "Likes",
        rate: "2.00",
        minOrder: 50,
        maxOrder: 50000,
        deliveryTime: "0-1 hour",
        active: true,
      },
      {
        name: "Instagram Likes - Global",
        category: "Likes",
        rate: "1.50",
        minOrder: 50,
        maxOrder: 100000,
        deliveryTime: "0-2 hours",
        active: true,
      },
      // Views
      {
        name: "Instagram Video Views",
        category: "Views",
        rate: "1.00",
        minOrder: 100,
        maxOrder: 1000000,
        deliveryTime: "0-30 minutes",
        active: true,
      },
      {
        name: "Instagram Story Views",
        category: "Views",
        rate: "2.50",
        minOrder: 100,
        maxOrder: 50000,
        deliveryTime: "0-1 hour",
        active: true,
      },
      // Comments
      {
        name: "Instagram Comments - Random",
        category: "Comments",
        rate: "8.00",
        minOrder: 10,
        maxOrder: 1000,
        deliveryTime: "1-6 hours",
        active: true,
      },
      {
        name: "Instagram Comments - Custom",
        category: "Comments",
        rate: "12.00",
        minOrder: 10,
        maxOrder: 500,
        deliveryTime: "2-12 hours",
        active: true,
      },
    ];

    await db.insert(services).values(defaultServices);
  }

  async logUserLogin(userId: number, instagramUsername: string): Promise<number> {
    const currentCount = await this.getUserLoginCount(userId);
    const newCount = currentCount + 1;
    
    await db.insert(loginLogs).values({
      userId,
      instagramUsername,
      loginCount: newCount,
    });
    
    return newCount;
  }

  async getUserLoginCount(userId: number): Promise<number> {
    const logs = await db.select().from(loginLogs).where(eq(loginLogs.userId, userId));
    return logs.length;
  }
}

export const storage = new DatabaseStorage();