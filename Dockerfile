FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

WORKDIR /app

# Copy source code
COPY . .

# Environment variables for build time
ARG NEXT_PUBLIC_SERVER_URL
ARG PORT
ARG CLIENT_PORT
ARG CLIENT_URL

# Set environment variables for build
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV PORT=$PORT
ENV CLIENT_PORT=$CLIENT_PORT
ENV CLIENT_URL=$CLIENT_URL
ENV NODE_ENV=production

# Build applications with runtime env support
RUN npm run client:build
RUN npm run server:build

EXPOSE 25577 25578

CMD ["npm", "start"]
