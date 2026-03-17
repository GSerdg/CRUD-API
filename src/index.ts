import 'dotenv/config';
import buildServer from './server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function main() {
  const app = await buildServer();

  await app.listen({ port: PORT, host: '0.0.0.0' });
  // eslint-disable-next-line no-console
  console.log(`Server (skeleton) listening at http://localhost:${PORT}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
