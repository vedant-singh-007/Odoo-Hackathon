# 🚀 EcoFinds Installation Guide

This guide will walk you through setting up EcoFinds on your local machine for development or production deployment.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **MongoDB** (v4.4.0 or higher)
- **Git** (for cloning the repository)
- **npm** or **yarn** (package manager)

### Check Your Versions

```bash
node --version    # Should be v14.0.0+
npm --version     # Should be v6.0.0+
mongod --version  # Should be v4.4.0+
git --version
```

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ecofinds-marketplace.git
cd ecofinds-marketplace
```

### 2. Install Dependencies

**Backend Dependencies:**
```bash
npm install
```

**Frontend Dependencies:**
```bash
cd client
npm install
cd ..
```

### 3. Environment Configuration

**Copy the environment template:**
```bash
cp env.example .env
```

**Edit the `.env` file with your configuration:**

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecofinds

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Client Configuration
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Configuration
PORT=5000
```

### 4. Database Setup

**Start MongoDB:**
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

**Verify MongoDB is running:**
```bash
mongosh
```

**Create the database (optional - will be created automatically):**
```bash
use ecofinds
```

### 5. Cloudinary Setup (for Image Uploads)

1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Navigate to your Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Update your `.env` file with these values

**Alternative: Local Image Storage**
If you prefer not to use Cloudinary, you can modify the image upload functionality to store images locally.

## 🚀 Running the Application

### Development Mode

**Option 1: Run both backend and frontend separately**

```bash
# Terminal 1: Start the backend server
npm run dev

# Terminal 2: Start the frontend development server
npm run client
```

**Option 2: Use npm scripts**

```bash
# Install both dependencies
npm run client-install

# Start both servers
npm run dev
```

### Production Mode

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## 🌐 Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🧪 Testing the Installation

### 1. Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "EcoFinds API is running!",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Frontend Access

Open your browser and navigate to http://localhost:3000. You should see the EcoFinds homepage.

### 3. Database Connection

Check if the database connection is working by creating a test user account.

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**2. MongoDB Connection Issues**
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

**3. Node Modules Issues**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For client
cd client
rm -rf node_modules package-lock.json
npm install
```

**4. Environment Variables Not Loading**
- Ensure your `.env` file is in the root directory
- Check that there are no spaces around the `=` sign
- Restart your development server after making changes

**5. CORS Issues**
- Verify `CLIENT_URL` in your `.env` file matches your frontend URL
- Check that the frontend is running on the correct port

### Debug Mode

**Enable debug logging:**
```bash
DEBUG=ecofinds:* npm run dev
```

**View detailed error messages:**
```bash
NODE_ENV=development npm run dev
```

## 📦 Production Deployment

### Heroku Deployment

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
heroku create your-app-name
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_production_secret
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set NODE_ENV=production
```

5. **Deploy**
```bash
git push heroku main
```

### Docker Deployment

1. **Build Docker Image**
```bash
docker build -t ecofinds .
```

2. **Run with Docker Compose**
```bash
docker-compose up --build
```

### VPS Deployment

1. **Clone repository on server**
```bash
git clone https://github.com/your-username/ecofinds-marketplace.git
cd ecofinds-marketplace
```

2. **Install dependencies**
```bash
npm install
cd client && npm install && npm run build && cd ..
```

3. **Set up PM2 for process management**
```bash
npm install -g pm2
pm2 start server.js --name ecofinds
pm2 startup
pm2 save
```

4. **Set up Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Security Considerations

### Production Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up proper CORS configuration
- [ ] Enable rate limiting
- [ ] Set up input validation
- [ ] Configure secure headers
- [ ] Use environment variables for sensitive data
- [ ] Set up database authentication
- [ ] Enable MongoDB security features

### Environment Variables Security

```env
# Production JWT Secret (use a strong, random string)
JWT_SECRET=your_very_long_and_random_secret_key_here

# Production MongoDB URI with authentication
MONGODB_URI=mongodb://username:password@localhost:27017/ecofinds

# Production environment
NODE_ENV=production

# Secure client URL
CLIENT_URL=https://your-domain.com
```

## 📊 Monitoring and Logging

### Application Monitoring

**Set up logging:**
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

**Health monitoring:**
```bash
# Check application health
curl http://localhost:5000/api/health

# Monitor logs
tail -f logs/combined.log
```

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify your environment** variables are correct
3. **Ensure all services** are running (MongoDB, Node.js)
4. **Check the GitHub Issues** for known problems
5. **Contact support** at hello@ecofinds.com

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Happy coding! 🌱**

*If you found this guide helpful, please consider giving us a star on GitHub!*
