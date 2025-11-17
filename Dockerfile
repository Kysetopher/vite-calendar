# Frontend Dockerfile for LiaiZen React Application
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API base URL build arg and env
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_BUILD_ID=$BUILD_ID

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

ARG BUILD_ID="dev"
ARG NGINX_CONF=nginx.conf

LABEL build.id=$BUILD_ID

# Copy built files to nginx
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Copy nginx configuration - use build argument to select which config file
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# Create version info file accessible via web
RUN echo "{\"build_id\": \"$BUILD_ID\"}" > /usr/share/nginx/html/version.json

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
