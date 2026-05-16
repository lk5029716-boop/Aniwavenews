FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.30.3

# Copy workspace files
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Install dependencies (no playwright install needed - already in base image)
RUN pnpm install --no-frozen-lockfile

# Build api-server
RUN pnpm --filter @workspace/api-server build

EXPOSE 10000

ENV NODE_ENV=production
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/ms-playwright/chromium-1080/chrome-linux/chrome

CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
