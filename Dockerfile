FROM node:22-alpine AS base
WORKDIR /app
ENV CI=true

COPY package*.json ./
RUN npm ci

FROM base AS build
ARG JWT_SECRET=
ARG DATABASE_URL=
ARG ADMIN_EMAIL=
ENV JWT_SECRET=${JWT_SECRET} \
    DATABASE_URL=${DATABASE_URL} \
    ADMIN_EMAIL=${ADMIN_EMAIL}

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["npm", "run", "start"]
