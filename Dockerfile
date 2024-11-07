# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Define build arguments with default values
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_VIDEO_API_BASE_URL

# Set as environment variables for build time
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

# Define the same arguments in the second stage
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_VIDEO_API_BASE_URL

# Set runtime environment variables
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_VIDEO_API_BASE_URL=$NEXT_PUBLIC_VIDEO_API_BASE_URL
ENV NEXT_INTERNAL_API_BASE_URL="http://backend:8080/api/v1"
ENV NEXT_INTERNAL_VIDEO_API_BASE_URL="http://backend:8080"

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]