# 🚀 EcoFinds Deployment Guide

This guide covers various deployment strategies for EcoFinds, from simple hosting platforms to enterprise-grade solutions.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Completed development and testing
- [ ] Set up production environment variables
- [ ] Configured database for production
- [ ] Set up image storage (Cloudinary or AWS S3)
- [ ] Configured domain and SSL certificates
- [ ] Set up monitoring and logging
- [ ] Created backup strategies

## 🌐 Deployment Options

### 1. Heroku (Recommended for Beginners)

Heroku provides an easy platform-as-a-service solution.

#### Setup Steps

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku App**
```bash
heroku create ecofinds-marketplace
```

3. **Add MongoDB Add-on**
```bash
heroku addons:create mongolab:sandbox
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set NODE_ENV=production
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
```

5. **Deploy**
```bash
git push heroku main
```

#### Heroku Configuration

**Procfile** (create in root directory):
```
web: npm start
```

**Package.json scripts** (already included):
```json
{
  "scripts": {
    "start": "node server.js",
    "heroku-postbuild": "npm run client-install && npm run build"
  }
}
```

### 2. DigitalOcean App Platform

DigitalOcean's App Platform offers a modern deployment experience.

#### Setup Steps

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select the repository and branch

2. **Configure Build Settings**
```yaml
# .do/app.yaml
name: ecofinds
services:
- name: web
  source_dir: /
  github:
    repo: your-username/ecofinds-marketplace
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    value: your_production_secret
  - key: MONGODB_URI
    value: your_mongodb_uri
```

3. **Add Database**
   - Add MongoDB managed database
   - Update MONGODB_URI environment variable

### 3. AWS EC2 with Docker

For more control and scalability.

#### Setup Steps

1. **Create EC2 Instance**
   - Launch Ubuntu 20.04 LTS instance
   - Configure security groups (ports 22, 80, 443)

2. **Install Docker**
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
```

3. **Create Dockerfile**
```dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build client
WORKDIR /app/client
RUN npm ci --only=production
RUN npm run build

WORKDIR /app

EXPOSE 5000

CMD ["npm", "start"]
```

4. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your_production_secret
      - MONGODB_URI=mongodb://mongo:27017/ecofinds
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:4.4
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
```

5. **Deploy**
```bash
docker-compose up -d
```

### 4. Vercel (Frontend) + Railway (Backend)

Split deployment for optimal performance.

#### Frontend (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "client/build/$1"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend.railway.app"
  }
}
```

3. **Deploy**
```bash
cd client
vercel --prod
```

#### Backend (Railway)

1. **Connect GitHub Repository**
   - Go to Railway.app
   - Connect your repository
   - Select the backend folder

2. **Set Environment Variables**
```env
NODE_ENV=production
JWT_SECRET=your_production_secret
MONGODB_URI=your_mongodb_uri
CLIENT_URL=https://your-frontend.vercel.app
```

### 5. Google Cloud Platform

Enterprise-grade deployment with GCP services.

#### Setup Steps

1. **Create Cloud Run Service**
```bash
gcloud run deploy ecofinds \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

2. **Set Environment Variables**
```bash
gcloud run services update ecofinds \
  --set-env-vars="NODE_ENV=production,JWT_SECRET=your_secret"
```

3. **Connect to Cloud SQL (MongoDB Atlas)**
```bash
gcloud run services update ecofinds \
  --add-cloudsql-instances=your-instance-connection-name
```

## 🔧 Production Configuration

### Environment Variables

Create a production `.env` file:

```env
# Production Configuration
NODE_ENV=production
PORT=5000

# Security
JWT_SECRET=your_very_long_and_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecofinds

# Client
CLIENT_URL=https://your-domain.com

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Database Setup

#### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster

2. **Configure Security**
   - Whitelist your deployment IP addresses
   - Create database user with read/write permissions

3. **Get Connection String**
```bash
mongodb+srv://username:password@cluster.mongodb.net/ecofinds?retryWrites=true&w=majority
```

#### Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt install mongodb

# Configure for production
sudo nano /etc/mongod.conf

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### SSL/HTTPS Setup

#### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring and Logging

### Application Monitoring

#### PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ecofinds',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### Log Management

```bash
# View logs
pm2 logs ecofinds

# Monitor
pm2 monit

# Restart on file changes
pm2 start server.js --watch
```

### Error Tracking with Sentry

1. **Install Sentry**
```bash
npm install @sentry/node @sentry/integrations
```

2. **Configure Sentry**
```javascript
// server.js
const Sentry = require('@sentry/node');
const { RewriteFrames } = require('@sentry/integrations');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new RewriteFrames({
      root: __dirname,
    }),
  ],
});

// Error handling middleware
app.use(Sentry.requestHandler());
app.use(Sentry.errorHandler());
```

### Health Checks

```javascript
// Enhanced health check
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    
    // Check external services
    const cloudinaryHealth = await checkCloudinaryHealth();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      database: 'connected',
      cloudinary: cloudinaryHealth ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: error.message
    });
  }
});
```

## 🔒 Security Hardening

### Security Headers

```javascript
// server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

### Input Validation

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/products', [
  body('title').isLength({ min: 3, max: 100 }).trim(),
  body('price').isFloat({ min: 0, max: 100000 }),
  body('description').isLength({ min: 10, max: 1000 }).trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process request
});
```

## 📈 Performance Optimization

### Caching Strategy

```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};

// Use caching
app.get('/api/products', cache(300), getProducts);
```

### Database Optimization

```javascript
// Add indexes for better performance
// In models/Product.js
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
```

### CDN Setup

```javascript
// Serve static files through CDN
app.use('/uploads', express.static('uploads'));

// Use CDN for images
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

## 🚨 Backup and Recovery

### Database Backup

```bash
# MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongodb_$DATE"

# Compress backup
tar -czf "/backups/mongodb_$DATE.tar.gz" "/backups/mongodb_$DATE"

# Upload to cloud storage (AWS S3)
aws s3 cp "/backups/mongodb_$DATE.tar.gz" s3://your-backup-bucket/

# Clean old backups (keep last 7 days)
find /backups -name "mongodb_*.tar.gz" -mtime +7 -delete
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

## 📞 Support and Maintenance

### Maintenance Mode

```javascript
// Maintenance middleware
const maintenance = (req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.status(503).json({
      message: 'Service temporarily unavailable for maintenance',
      estimatedRestoreTime: '2023-12-07T15:00:00Z'
    });
  }
  next();
};

app.use(maintenance);
```

### Health Monitoring

```bash
# Create monitoring script
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/api/health)

if [ $response -ne 200 ]; then
  echo "Health check failed with status: $response"
  # Send alert (email, Slack, etc.)
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"EcoFinds health check failed!"}' \
    https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
fi
```

---

**Congratulations! 🎉** Your EcoFinds application should now be successfully deployed and running in production.

For additional support or questions, please refer to our [GitHub Issues](https://github.com/your-username/ecofinds-marketplace/issues) or contact us at hello@ecofinds.com.
