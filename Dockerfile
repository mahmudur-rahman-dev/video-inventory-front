# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Define build arguments with default values
ARG NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api/v1"
ARG NEXT_PUBLIC_VIDEO_API_BASE_URL="http://localhost:8080"

# Set as environment variables
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_VIDEO_API_BASE_URL=$NEXT_PUBLIC_VIDEO_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set runtime environment variables
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_VIDEO_API_BASE_URL=$NEXT_PUBLIC_VIDEO_API_BASE_URL

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]