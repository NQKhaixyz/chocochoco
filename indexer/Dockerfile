FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace manifests
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy indexer package manifest
COPY indexer/package.json indexer/package.json

# Install deps (workspace-aware)
RUN pnpm install --frozen-lockfile

# Copy indexer sources
COPY indexer/tsconfig.json indexer/tsconfig.json
COPY indexer/src indexer/src
COPY indexer/idl indexer/idl
COPY indexer/schema.sql indexer/schema.sql
COPY indexer/schema-sqlite.sql indexer/schema-sqlite.sql

# Build indexer
RUN pnpm --filter @chocochoco/indexer build

FROM node:20-alpine
WORKDIR /app/indexer

# Copy runtime artifacts
COPY --from=builder /app/indexer/dist ./dist
COPY --from=builder /app/indexer/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/indexer/idl ./idl
COPY --from=builder /app/indexer/schema.sql ./schema.sql
COPY --from=builder /app/indexer/schema-sqlite.sql ./schema-sqlite.sql

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]

