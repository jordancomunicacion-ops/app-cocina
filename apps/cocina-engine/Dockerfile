FROM node:20-alpine

WORKDIR /app

# Install dependencies sans lockfile
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Generate Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build
RUN npm run build

EXPOSE 3000

ENV PORT=3000

# Start Production
CMD ["node", "dist/main"]
