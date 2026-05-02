const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const User = require('./models/User');

// Database Connection
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error('FATAL ERROR: MONGO_URI is not defined.');
  process.exit(1);
}

mongoose.connect(dbURI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // DEMO SEEDING LOGIC
    try {
      const adminExists = await User.findOne({ email: 'admin@test.com' });
      if (!adminExists) {
        await User.create({
          name: 'Demo Admin',
          email: 'admin@test.com',
          password: '123456', // Pre-save hook hashes this automatically
          role: 'Admin'
        });
        console.log('✅ Demo Admin account seeded');
      }

      const memberExists = await User.findOne({ email: 'member@test.com' });
      if (!memberExists) {
        await User.create({
          name: 'Demo Member',
          email: 'member@test.com',
          password: '123456',
          role: 'Member'
        });
        console.log('✅ Demo Member account seeded');
      }
    } catch (err) {
      console.error('Error seeding demo users:', err.message);
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
