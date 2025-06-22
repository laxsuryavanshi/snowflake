FROM node:22.16-alpine3.22 AS build

WORKDIR /snowflake

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]

COPY .yarn/releases .yarn/releases

COPY packages/typescript-config packages/typescript-config

COPY projects/spencr/package.json projects/spencr/package.json

RUN yarn workspaces focus @turtleby/spencr

COPY projects/spencr projects/spencr

RUN yarn workspace @turtleby/spencr run prepare \
  && yarn workspaces foreach -Rpt --from @turtleby/spencr run build \
  && rm -rf node_modules \
  && yarn workspaces focus @turtleby/spencr --production

FROM node:22.16-alpine3.22

WORKDIR /spencr

ENV NODE_ENV=production

COPY --from=build /snowflake/node_modules node_modules

COPY --from=build /snowflake/projects/spencr/dist .

EXPOSE 3000

ENV PORT=3000 HOSTNAME="0.0.0.0"

RUN chown -R node:node /spencr

USER node

CMD ["node", "index.js"]
