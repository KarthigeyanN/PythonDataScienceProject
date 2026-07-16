import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { PrismaClientSingleton } from './lib/database/PrismaClient';

const PORT = process.env.PORT || 3001;

async function main(): Promise<void> {
  const app = createApp();

  // Verify database connection
  try {
    const prisma = PrismaClientSingleton.getInstance();
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await PrismaClientSingleton.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await PrismaClientSingleton.disconnect();
  process.exit(0);
});

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});