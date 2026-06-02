# Backend API Documentation

This document provides detailed information about the backend API endpoints and data structures.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-app.railway.app`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

## Response Format

All responses are in JSON format with consistent structure:

### Success Response
```json
{
  "data": {},
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Auth Endpoints

#### Register
- **Method**: POST
- **Path**: `/auth/register`
- **Auth**: No
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "fullName": "John Doe"
  }
  ```
- **Response**: `{ token: string, user: User }`

#### Login
- **Method**: POST
- **Path**: `/auth/login`
- **Auth**: No
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: `{ token: string, user: User }`

#### Get Current User
- **Method**: GET
- **Path**: `/auth/me`
- **Auth**: Yes
- **Response**: `User`

### Plan Endpoints

#### Get All Plans
- **Method**: GET
- **Path**: `/plans`
- **Auth**: Yes
- **Response**: `SubscriptionPlan[]`

#### Get Plan by ID
- **Method**: GET
- **Path**: `/plans/:id`
- **Auth**: Yes
- **Response**: `SubscriptionPlan`

#### Create Plan
- **Method**: POST
- **Path**: `/plans`
- **Auth**: Yes
- **Body**:
  ```json
  {
    "name": "Pro Plan",
    "price": 29.99,
    "billingCycle": "month",
    "description": "Professional features",
    "features": {}
  }
  ```
- **Response**: `SubscriptionPlan`

#### Update Plan
- **Method**: PUT
- **Path**: `/plans/:id`
- **Auth**: Yes
- **Body**: Partial `SubscriptionPlan`
- **Response**: `SubscriptionPlan`

#### Delete Plan
- **Method**: DELETE
- **Path**: `/plans/:id`
- **Auth**: Yes
- **Response**: `{ message: string }`

### Subscription Endpoints

#### Get User Subscriptions
- **Method**: GET
- **Path**: `/subscriptions`
- **Auth**: Yes
- **Response**: `Subscription[]`

#### Create Subscription
- **Method**: POST
- **Path**: `/subscriptions`
- **Auth**: Yes
- **Body**:
  ```json
  {
    "planId": "uuid",
    "stripeCustomerId": "cus_xxx",
    "paymentMethodId": "pm_xxx"
  }
  ```
- **Response**: `Subscription`

#### Cancel Subscription
- **Method**: POST
- **Path**: `/subscriptions/:id/cancel`
- **Auth**: Yes
- **Body**:
  ```json
  {
    "atPeriodEnd": true
  }
  ```
- **Response**: `Subscription`

#### Get Subscription Invoices
- **Method**: GET
- **Path**: `/subscriptions/:subscriptionId/invoices`
- **Auth**: Yes
- **Response**: `Invoice[]`

## Data Types

### User
```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  created_at: Date;
  updated_at: Date;
}
```

### SubscriptionPlan
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features?: Record<string, any>;
  stripe_price_id?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Subscription
```typescript
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'past_due' | 'canceled' | 'paused';
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  ended_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Invoice
```typescript
interface Invoice {
  id: string;
  subscription_id: string;
  stripe_invoice_id?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'void' | 'uncollectible';
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### PaymentMethod
```typescript
interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  card_brand?: string;
  card_last_four?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}
```

## Error Codes

- `INVALID_CREDENTIALS`: Email or password is incorrect
- `USER_EXISTS`: Email already registered
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Not authenticated or unauthorized
- `VALIDATION_ERROR`: Invalid request data
- `SERVER_ERROR`: Internal server error

## Rate Limiting

Currently not implemented. Consider adding for production:

```typescript
// Recommended limits
- Auth endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- Heavy operations: 10 requests per minute
```

## Pagination

List endpoints support pagination (to be implemented):

```
?page=1&limit=20&sort=created_at&order=DESC
```

## Webhook Events

Stripe webhook events to handle:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.created`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Configure webhook endpoint: POST `/webhooks/stripe`
