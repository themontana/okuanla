import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
});

// Security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "pagead2.googlesyndication.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "api.openai.com"],
            fontSrc: ["'self'", "cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin']
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://www.okuanla.net', 'https://okuanla.net']
        : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
};

// Cache control middleware
const cacheControl = (req, res, next) => {
    // Cache static assets for 1 week
    if (req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
        return next();
    }

    // Cache API responses for 1 hour
    if (req.path.startsWith('/api/')) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return next();
    }

    // No cache for dynamic content
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Request logging middleware
const requestLogger = morgan('combined');

export {
    limiter,
    securityHeaders,
    corsOptions,
    cors,
    compression,
    cacheControl,
    errorHandler,
    requestLogger
};
