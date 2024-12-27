const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const doctorRoutes = require('./routes/doctor.routes');

const app = express();
const port = process.env.PORT || 3000; // Using 3000 to avoid conflict with patient service

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Routes
app.use('/', doctorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database sync and server start
async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
    
    app.listen(port, () => {
      console.log(`Doctor service listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
