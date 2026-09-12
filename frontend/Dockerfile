# Stage 1: Build production React bundle
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY . .

# Build production artifacts (outputs to /app/dist)
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default Nginx html files
RUN rm -rf ./*

# Copy built assets from build stage
COPY --from=build /app/dist .

# Copy custom Nginx configuration with SPA routing and API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
