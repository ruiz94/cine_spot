import express from 'express';
import { UserService } from './services/userService';

const app = express();
const PORT = process.env['PORT'] || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/user/register', async (req, res) => {
  try {
    const { username, name, email, password, birthdate } = req.body;
    if (!username || !name || !email || !password || !birthdate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await UserService.createUser({
      username,
      name,
      email,
      password, // Password in plain text
      birthdate: new Date(birthdate),
    });
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user, // Do not include hashed password
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});
