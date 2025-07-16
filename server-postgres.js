import express from 'express';
import cors from 'cors';
import pg from 'pg';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Database configuration - supports both PostgreSQL and MySQL
const isDatabasePostgres = process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres';
let pool;

if (isDatabasePostgres) {
  // PostgreSQL configuration
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
} else {
  // MySQL configuration (fallback)
  import('mysql2/promise').then(mysql => {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chamahub',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  });
}

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// SMS configuration (Twilio)
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'your-twilio-account-sid',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'your-twilio-auth-token',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
};

// Create email transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Initialize Twilio client
let twilioClient = null;
if (twilioConfig.accountSid.startsWith('AC') && twilioConfig.authToken !== 'your-twilio-auth-token') {
  try {
    twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Twilio client:', error.message);
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Helper functions
const hashPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

// Database helper functions
const executeQuery = async (query, params = []) => {
  if (isDatabasePostgres) {
    const result = await pool.query(query, params);
    return result.rows;
  } else {
    const [rows] = await pool.execute(query, params);
    return rows;
  }
};

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: isDatabasePostgres ? 'PostgreSQL' : 'MySQL'
  });
});

// Test endpoint
app.get('/api/users', async (req, res) => {
  try {
    // Return empty array for now - will be populated once database is set up
    res.json([]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For now, return success - database schema will be set up later
    const user = {
      id: Date.now().toString(),
      email,
      first_name: first_name || null,
      last_name: last_name || null,
      phone: phone || null,
      created_at: new Date().toISOString()
    };

    res.json(user);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For now, return test user - will be replaced with actual authentication
    const user = {
      id: '1',
      email,
      first_name: 'Test',
      last_name: 'User',
      phone: null,
      created_at: new Date().toISOString()
    };

    res.json(user);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error signing in' });
  }
});

// Groups endpoints
app.get('/api/groups', async (req, res) => {
  try {
    res.json([]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving groups' });
  }
});

app.get('/api/groups/user/:userId', async (req, res) => {
  try {
    res.json([]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving user groups' });
  }
});

// Loans endpoints
app.get('/api/loans/user/:userId', async (req, res) => {
  try {
    res.json([]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving user loans' });
  }
});

// Contributions endpoints
app.get('/api/contributions/user/:userId', async (req, res) => {
  try {
    res.json([]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving contributions' });
  }
});

// Notifications endpoints
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    res.json([]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving notifications' });
  }
});

// Payment methods endpoints
app.get('/api/payment-methods/user/:userId', async (req, res) => {
  try {
    res.json([]);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving payment methods' });
  }
});

// User profile endpoints
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Return test user for now
    const user = {
      id: userId,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      phone: null,
      created_at: new Date().toISOString()
    };

    res.json(user);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: 'Error retrieving user profile' });
  }
});

// Catch-all for undefined routes
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ChamaHub API server running at port ${PORT}`);
  console.log(`📊 Database: ${isDatabasePostgres ? 'PostgreSQL' : 'MySQL'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server is ready to accept connections');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});
