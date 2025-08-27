import express from 'express';

//Import Routes
import { userRoutes, authRoutes } from './routes';

//Import middlewares
import { authenticateToken } from './middlewares';

const app = express();
const PORT = process.env['PORT'] || 5000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok...' });
});
app.use('/auth', authRoutes);

app.use(authenticateToken);
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
