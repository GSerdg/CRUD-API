import 'dotenv/config';
import { buildServer } from './app.js';

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  const app = await buildServer();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
