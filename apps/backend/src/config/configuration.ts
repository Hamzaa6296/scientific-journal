// PURPOSE: One centralized place for all environment variables.
// Instead of calling process.env.SOMETHING in 20 different files,
// we read everything here once and inject it via NestJS's ConfigService.
// This gives us type safety and a single place to change variable names.

export default () => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  database: {
    uri: process.env.MONGO_URI,
  },
  // JWT uses TWO tokens:
  // accessToken  → short-lived (15min), sent with every request
  // refreshToken → long-lived (7d), only used to get a new accessToken
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10) || 587,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },

  frontendurl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
});
