import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

// Centralized error handling
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred.';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
