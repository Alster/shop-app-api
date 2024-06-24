# Base node image:
FROM node:20-alpine AS base
RUN yarn set version berry
RUN yarn config set enableGlobalCache true
RUN yarn config set globalFolder /usr/local/share/.cache/yarn2

# Installing dev dependencies:
FROM base AS install-dev-dependencies
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,sharing=locked,id=yarn2,target=/usr/local/share/.cache/yarn2,rw yarn
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Installing prod dependencies:
FROM base AS install-prod-dependencies
ENV NODE_ENV production
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN --mount=type=cache,sharing=locked,id=yarn2,target=/usr/local/share/.cache/yarn2,rw yarn workspaces focus --all --production
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Creating a build:
FROM base AS create-build
ENV NODE_ENV production
WORKDIR /app
COPY . .
COPY --from=install-dev-dependencies /app ./
RUN yarn run build
USER node

# Running the application:
FROM base AS run
ENV NODE_ENV production
WORKDIR /app
COPY --from=create-build /app/build ./
COPY --from=install-prod-dependencies /app/node_modules ./node_modules

CMD ["yarn", "start"]

