import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { handler as svelteHandler } from './dist/handler.js';
import logger from './logger.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(pinoHttp({ logger }));
app.use(express.json());

app.use(svelteHandler);

export default app;
