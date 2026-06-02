# GameChanger - Subscription Management Platform

A modern, full-stack subscription management application built with Node.js, TypeScript, React, and PostgreSQL. Designed for Railway deployment with Stripe integration.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Subscription Management**: Create, manage, and cancel subscriptions
- **Flexible Billing Cycles**: Support for monthly and annual billing
- **Invoice Tracking**: Generate and view invoices for subscriptions
- **Payment Integration**: Stripe integration for payments
- **Responsive UI**: Modern React frontend with Ant Design
- **Railway Ready**: Pre-configured for Railway deployment
- **Docker Support**: Easy local development with Docker Compose

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Payments**: Stripe
- **ORM**: Raw SQL with postgres driver

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Library**: Ant Design
- **State Management**: Zustand
- **HTTP Client**: Axios

## 📁 Project Structure

```
gamechanger/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # External service integrations
│   │   ├── migrations/        # Database migrations
│   │   ├── db.ts              # Database connection
│   │   └── index.ts           # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service clients
│   │   ├── store/             # Zustand stores
│   │   ├── App.tsx            # Main App component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── package.json               # Root workspace config
├── docker-compose.yml
├── railway.json
├── Dockerfile
└── README.md
```

## 🛠️ Local Development

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ (or use Docker)
- Stripe account for payment integration

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gamechanger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Backend (`.env`):
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

   Frontend (`.env`):
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   cd ..
   ```

4. **Set up the database**
   
   Option A: Using Docker Compose (easiest)
   ```bash
   docker-compose up -d
   ```

   Option B: Manual PostgreSQL setup
   ```bash
   # Create database
   createdb gamechanger
   
   # Run migrations
   npm run migrate
   ```

5. **Start development servers**
   ```bash
   # From root directory - starts both backend and frontend
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health: http://localhost:3000/health

## 📚 API Documentation

### Authentication

**Register User**
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "fullName": "John Doe"
}

Response: { token, user }
```

**Login**
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: { token, user }
```

**Get Current User**
```
GET /auth/me
Authorization: Bearer <token>

Response: { id, email, fullName }
```

### Subscription Plans

**Get All Plans**
```
GET /plans
Authorization: Bearer <token>

Response: [{ id, name, price, billing_cycle, ... }]
```

**Get Plan by ID**
```
GET /plans/:id
Authorization: Bearer <token>

Response: { id, name, price, billing_cycle, ... }
```

**Create Plan**
```
POST /plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pro Plan",
  "price": 29.99,
  "billingCycle": "month",
  "description": "Professional features",
  "features": { "feature1": true }
}

Response: { id, ... }
```

### Subscriptions

**Get User Subscriptions**
```
GET /subscriptions
Authorization: Bearer <token>

Response: [{ id, user_id, plan_id, status, plan, ... }]
```

**Create Subscription**
```
POST /subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "plan-uuid",
  "stripeCustomerId": "cus_xxxxx",
  "paymentMethodId": "pm_xxxxx"
}

Response: { id, user_id, plan_id, status, ... }
```

**Cancel Subscription**
```
POST /subscriptions/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "atPeriodEnd": true
}

Response: { id, status, canceled_at, ... }
```

**Get Subscription Invoices**
```
GET /subscriptions/:subscriptionId/invoices
Authorization: Bearer <token>

Response: [{ id, amount, status, created_at, ... }]
```

## 🚀 Deployment on Railway

### One-Click Deploy

1. Visit [Railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add PostgreSQL database
5. Configure environment variables (see RAILWAY_DEPLOYMENT.md)
6. Deploy!

### Manual Deployment

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

### Environment Variables for Railway

```
DATABASE_URL=<set by Railway PostgreSQL plugin>
JWT_SECRET=your_secure_jwt_secret
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
FRONTEND_URL=https://your-app.railway.app
NODE_ENV=production
PORT=3000
```

## 💳 Stripe Integration

### Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Dashboard
3. Add keys to environment variables

### Testing

Use Stripe test credentials:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## 🐳 Docker Support

### Build Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Run Services

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Building for Production

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Build Both
```bash
npm run build
```

## 🧪 Testing

To add tests, install testing libraries:

```bash
# Backend tests
cd backend
npm install --save-dev jest @types/jest ts-jest

# Frontend tests
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## 🔒 Security Considerations

- Always use environment variables for sensitive data
- Keep dependencies updated
- Use strong JWT secrets
- Implement rate limiting for production
- Add request validation using Joi
- Use HTTPS in production
- Implement CORS properly
- Add input sanitization

## 📝 Database Schema

The application uses the following tables:

- **users**: User accounts and authentication
- **subscription_plans**: Available subscription plans
- **subscriptions**: User subscriptions to plans
- **invoices**: Payment invoices
- **payment_methods**: Stored payment methods

Run migrations to set up:
```bash
npm run migrate
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT

## 📞 Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with detailed information
- Include error logs and steps to reproduce

## 🔄 Next Steps

After deployment:

1. Set up Stripe webhooks for payment events
2. Configure email notifications
3. Add payment card management UI
4. Implement subscription renewal logic
5. Add admin dashboard for subscription management
6. Set up monitoring and alerting
7. Configure backups for database

## 📚 Resources

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
