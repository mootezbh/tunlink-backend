export default () => ({
  environment: process.env.NODE_ENV || `development`,
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  host: process.env.HOST || `localhost:3000`,
  apiKey: process.env.API_KEY,
});
