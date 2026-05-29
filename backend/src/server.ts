import app from './app';
import prisma from './config/database';

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════╗');
      console.log('║       🎮 BUST API SERVER RUNNING      ║');
      console.log('╠══════════════════════════════════════╣');
      console.log(`║  URL:  http://localhost:${PORT}          ║`);
      console.log(`║  ENV:  ${process.env.NODE_ENV || 'development'}                  ║`);
      console.log('╚══════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
