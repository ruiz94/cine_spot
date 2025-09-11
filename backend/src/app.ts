import express from 'express';

//Import Routes
import { userRoutes, authRoutes, roomsRoutes } from './routes';

//Import middlewares
import { authenticateToken } from './middlewares';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok...' });
});
app.use('/auth', authRoutes);

app.use(authenticateToken);
app.use('/users', userRoutes);
app.use('/rooms', roomsRoutes);

export default app;
