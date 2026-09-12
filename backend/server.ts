import dotenv from 'dotenv';
import path from 'path';
import { createApp } from './app';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PORT = Number(process.env.PORT || 3000);

function startServer() {
  const app = createApp();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shopzy API running on http://localhost:${PORT}`);
  });
}

startServer();
