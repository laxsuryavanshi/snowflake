FROM node:22.16-alpine3.22 AS build

WORKDIR /snowflake

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]

COPY .yarn/releases .yarn/releases

COPY packages/typescript-config packages/typescript-config

COPY projects/idms/package.json projects/idms/package.json

RUN yarn workspaces focus @turtleby/idms

COPY projects/idms projects/idms

RUN yarn workspace @turtleby/idms run prepare \
  && yarn workspaces foreach -Rpt --from @turtleby/idms run build \
  && rm -rf node_modules \
  && yarn workspaces focus @turtleby/idms --production

FROM node:22.16-alpine3.22

WORKDIR /idms

ENV NODE_ENV=production

COPY --from=build /snowflake/node_modules node_modules

COPY --from=build /snowflake/projects/idms/dist .

EXPOSE 3000

ENV PORT=3000 HOSTNAME="0.0.0.0"

RUN chown -R node:node /idms

USER node

CMD ["node", "index.js"]
