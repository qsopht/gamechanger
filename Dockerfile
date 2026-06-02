FROM node:18-alpine

WORKDIR /app

# Copy root package
COPY package.json package-lock.json ./

# Copy backend
COPY backend ./backend

# Copy frontend
COPY frontend ./frontend

# Install dependencies
RUN npm ci

# Build backend and frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start backend server
CMD ["npm", "start"]
