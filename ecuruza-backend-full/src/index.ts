import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/database';
import authRoutes from './modules/auth/routes/auth.routes';
import paymentsRoutes from './routes/payments.routes';
import { log } from './utils/logger';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);

app.get('/', (req, res) => res.send('Ecuruza backend running successfully 🚀'));

// global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => log(`Server running on port ${PORT}`));
}

export default app;
