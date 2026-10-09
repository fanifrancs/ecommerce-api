// src/app.ts
import Fastify from 'fastify';

// Why does buildApp() need to return a Promise?
// In Fastify, configuring a server isn't purely synchronous.
// As the application grows, buildApp() will execute
// asynchronous operations like database connections
// before the server is ready to handle requests.
export async function buildApp() {
  // Instantiates Fastify and passes an options object to configure
  // the framework's internal behavior.
  const app = Fastify({
    // logger:: Fastify has Pino (a ultra-fast JSON logger) built
    // directly into its core. Passing an object here configures
    // how Pino formats and outputs logs.
    logger: {
      transport: {
        // target:: tells Pino to pass raw JSON logs through the pino-pretty
        // module, transforming dense JSON into color-coded, human-readable
        // text in the terminal.
        target: 'pino-pretty',
        // options:: configures how pino-pretty formats logs. In this case,
        // we want to display timestamps in a human-readable format and
        // ignore the pid and hostname fields, which are not useful for
        // local development.
        options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' }
      }
    }
  });

  // Health check route
  app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}