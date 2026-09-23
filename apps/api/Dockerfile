# Build from the monorepo root: docker build -f apps/api/Dockerfile .
FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --ignore-scripts --workspace @marmoteiro/api --include-workspace-root
COPY apps/api apps/api
COPY packages/shared packages/shared
RUN npm run prisma:generate --workspace @marmoteiro/api && npm run build --workspace @marmoteiro/api

# Explicit release job; migrations never run automatically on every startup.
FROM build AS migrate
USER node
CMD ["npm", "run", "prisma:deploy", "--workspace", "@marmoteiro/api"]

FROM build AS production-dependencies
RUN npm prune --omit=dev --workspace @marmoteiro/api --include-workspace-root

FROM base AS runtime
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0 OUTBOX_RUNNER=scheduled COMMUNICATIONS_ENABLED=false DATABASE_POOL_MAX=3
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=node:node /app/packages/shared ./packages/shared
USER node
EXPOSE 8080
CMD ["node", "apps/api/dist/main.js"]
