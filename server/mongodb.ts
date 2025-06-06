import mongoose from 'mongoose';

// MongoDB connection with proper configuration
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/smm-panel';

// User Schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  instagramUsername: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  bonusClaimed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  serviceName: {
    type: String,
    required: true
  },
  instagramUsername: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Processing', 'Completed', 'Failed', 'Pending'],
    default: 'Processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  utrNumber: {
    type: String,
    required: true,
    unique: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Service Schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  minOrder: {
    type: Number,
    required: true,
    min: 1
  },
  maxOrder: {
    type: Number,
    required: true,
    min: 1
  },
  deliveryTime: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
});

// Login Log Schema
const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  instagramUsername: {
    type: String,
    required: true
  },
  loginCount: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Models
export const User = mongoose.model('User', userSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const Service = mongoose.model('Service', serviceSchema);
export const LoginLog = mongoose.model('LoginLog', loginLogSchema);

// MongoDB Connection Function
export async function connectMongoDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Connecting to MongoDB...');
      
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false
      });
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      
      // Initialize default services if collection is empty
      await initializeServices();
      
    } else {
      console.log('✅ MongoDB already connected');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// Initialize default services
async function initializeServices() {
  try {
    const serviceCount = await Service.countDocuments();
    
    if (serviceCount === 0) {
      console.log('🔄 Initializing default services...');
      
      const defaultServices = [
        {
          name: "Instagram Followers - Indian",
          category: "Followers",
          rate: 4.00,
          minOrder: 100,
          maxOrder: 100000,
          deliveryTime: "0-2 hours",
          active: true
        },
        {
          name: "Instagram Followers - USA",
          category: "Followers",
          rate: 5.00,
          minOrder: 100,
          maxOrder: 50000,
          deliveryTime: "0-4 hours",
          active: true
        },
        {
          name: "Instagram Followers - Global",
          category: "Followers",
          rate: 3.50,
          minOrder: 100,
          maxOrder: 200000,
          deliveryTime: "0-6 hours",
          active: true
        },
        {
          name: "Instagram Likes - Indian",
          category: "Likes",
          rate: 2.00,
          minOrder: 50,
          maxOrder: 50000,
          deliveryTime: "0-1 hour",
          active: true
        },
        {
          name: "Instagram Likes - Global",
          category: "Likes",
          rate: 1.50,
          minOrder: 50,
          maxOrder: 100000,
          deliveryTime: "0-2 hours",
          active: true
        },
        {
          name: "Instagram Video Views",
          category: "Views",
          rate: 1.00,
          minOrder: 100,
          maxOrder: 1000000,
          deliveryTime: "0-30 minutes",
          active: true
        },
        {
          name: "Instagram Story Views",
          category: "Views",
          rate: 2.50,
          minOrder: 100,
          maxOrder: 50000,
          deliveryTime: "0-1 hour",
          active: true
        },
        {
          name: "Instagram Comments - Random",
          category: "Comments",
          rate: 8.00,
          minOrder: 10,
          maxOrder: 1000,
          deliveryTime: "1-6 hours",
          active: true
        },
        {
          name: "Instagram Comments - Custom",
          category: "Comments",
          rate: 12.00,
          minOrder: 10,
          maxOrder: 500,
          deliveryTime: "2-12 hours",
          active: true
        }
      ];
      
      await Service.insertMany(defaultServices);
      console.log('✅ Default services initialized successfully');
    } else {
      console.log(`✅ Services already exist (${serviceCount} services)`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
}

// Disconnect function
export async function disconnectMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnect error:', error);
  }
}

// Type definitions for better TypeScript support
export interface IUser {
  _id?: string;
  uid: string;
  instagramUsername: string;
  password: string;
  walletBalance: number;
  bonusClaimed: boolean;
  createdAt?: Date;
}

export interface IOrder {
  _id?: string;
  orderId: string;
  userId: string;
  serviceName: string;
  instagramUsername: string;
  quantity: number;
  price: number;
  status: 'Processing' | 'Completed' | 'Failed' | 'Pending';
  createdAt?: Date;
}

export interface IPayment {
  _id?: string;
  userId: string;
  amount: number;
  utrNumber: string;
  paymentMethod: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: Date;
}

export interface IService {
  _id?: string;
  name: string;
  category: string;
  rate: number;
  minOrder: number;
  maxOrder: number;
  deliveryTime: string;
  active: boolean;
}

export interface ILoginLog {
  _id?: string;
  userId: string;
  instagramUsername: string;
  loginCount: number;
  createdAt?: Date;
}