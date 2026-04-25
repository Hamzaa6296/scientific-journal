"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 5000,
    database: {
        uri: process.env.MONGO_URI,
    },
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
});
//# sourceMappingURL=configuration.js.map