import pino from 'pino';

const logger = pino({
  name: 'idms:root',
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', "res.headers['set-cookie']"],
    remove: true,
  },
});

export default logger;
