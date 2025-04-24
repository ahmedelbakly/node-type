import express from 'express';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';


const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
