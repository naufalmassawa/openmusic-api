const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  rabbitmq: {
    host: process.env.RABBITMQ_SERVER,
  },
};

module.exports = config;
