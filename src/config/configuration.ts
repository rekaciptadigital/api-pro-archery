export default () => ({
  appUrl: process.env.APP_URL || 'http://localhost:4000',
  port: parseInt(process.env.PORT || '4000', 10),
  trustProxy: process.env.TRUST_PROXY === 'true',
  timezone: process.env.TZ || 'UTC',
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },
  cors: {
    origins: ['https://bolt.new'].concat((process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)),
    credentials: true
  },
  swagger: {
    user: process.env.SWAGGER_USER || 'admin',
    password: process.env.SWAGGER_PASSWORD || 'admin123'
  }
});