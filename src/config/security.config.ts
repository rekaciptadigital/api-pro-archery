import { HelmetOptions } from 'helmet';

export const securityConfig: HelmetOptions = {
  crossOriginResourcePolicy: { 
    policy: "cross-origin" 
  },
  crossOriginOpenerPolicy: { 
    policy: "same-origin-allow-popups" 
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://inventory.proarchery.id", "https://bolt.new"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  }
};