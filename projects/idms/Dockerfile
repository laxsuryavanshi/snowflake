FROM node:22.16-alpine3.22 AS build

WORKDIR /snowflake

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]

COPY .yarn/releases .yarn/releases

COPY packages/graceful-shutdown packages/graceful-shutdown
COPY packages/typescript-config packages/typescript-config

COPY projects/idms/package.json projects/idms/package.json

RUN yarn workspaces focus @turtleby/idms

COPY projects/idms/src projects/idms/src
COPY projects/idms/static projects/idms/static
COPY [ \
  "projects/idms/tsconfig.json", \
  "projects/idms/svelte.config.js", \
  "projects/idms/vite.config.js", \
  "./projects/idms/"]

RUN yarn workspace @turtleby/idms run prepare \
  && yarn workspaces foreach -Rpt --from @turtleby/idms run build \
  && rm -rf node_modules \
  && yarn workspaces focus @turtleby/idms --production \
  && rm -rf node_modules/@turtleby/graceful-shutdown \
  && mkdir -p node_modules/@turtleby \
  && mv -f packages/graceful-shutdown node_modules/@turtleby/graceful-shutdown

FROM node:22.16-alpine3.22

WORKDIR /idms

ENV NODE_ENV=production PORT=3000

COPY --from=build /snowflake/node_modules node_modules

COPY --from=build /snowflake/projects/idms/dist dist

COPY [ \
  "projects/idms/app.js", \
  "projects/idms/logger.js", \
  "projects/idms/server.js", \
  "./"]

EXPOSE 3000

RUN chown -R node:node /idms

USER node

CMD ["node", "server.js"]
