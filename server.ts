import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { startLocalSmtpServer } from './src/server/localSmtp.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Start a local SMTP server for OTP emails if no SMTP provider is configured
  if (!process.env.SMTP_HOST) {
    startLocalSmtpServer(Number(process.env.SMTP_PORT) || 1025);
  }

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('No MONGODB_URI provided. Starting in-memory MongoDB...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);

    // Seed default user if none exists
    const User = (await import('./src/server/models/User.js')).default;
    const bcrypt = (await import('bcryptjs')).default;
    const defaultEmail = 'bdp.0231@gmail.com';
    const existingUser = await User.findOne({ email: defaultEmail });
    
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Admin User',
        email: defaultEmail,
        password: hashedPassword,
        role: 'Inventory Manager',
      });
      console.log(`Seeded default user: ${defaultEmail} / password123`);
    }

  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Import routes dynamically or statically
  const authRoutes = await import('./src/server/routes/auth.js');
  const productRoutes = await import('./src/server/routes/products.js');
  const warehouseRoutes = await import('./src/server/routes/warehouses.js');
  const operationRoutes = await import('./src/server/routes/operations.js');
  const dashboardRoutes = await import('./src/server/routes/dashboard.js');

  app.use('/api/auth', authRoutes.default);
  app.use('/api/products', productRoutes.default);
  app.use('/api/warehouses', warehouseRoutes.default);
  app.use('/api/operations', operationRoutes.default);
  app.use('/api/dashboard', dashboardRoutes.default);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler (prevents crashes on thrown errors)
  app.use((err: any, req: any, res: any, next: any) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Graceful handling of uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

startServer();
