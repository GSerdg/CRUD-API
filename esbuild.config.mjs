import * as esbuild from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  outfile: 'dist/main.js',
  sourcemap: !isProduction,
  minify: isProduction,

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },

  external: ['fastify', '@fastify/env', 'dotenv'],
};

try {
  await esbuild.build(config);
  console.log('⚡ Build complete');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (err) {
  process.exit(1);
}
