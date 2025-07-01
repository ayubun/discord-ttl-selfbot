# setup layer
FROM node:18-alpine AS setup

WORKDIR /app

COPY package*.json ./
COPY src/ ./src/

RUN npm ci --only=production && npm cache clean --force

# runtime layer
FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=setup /app/src/ ./src/
COPY --from=setup /app/node_modules/ ./node_modules/

ENTRYPOINT ["node", "src/cli.js"]

CMD ["--help"]