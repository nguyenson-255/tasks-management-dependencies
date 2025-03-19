FROM node:20-alpine AS development

WORKDIR /son/app

COPY package*.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./

RUN npm ci
RUN npm run build

EXPOSE 3000

FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /son/app

COPY --from=development son/app/ .

RUN npm run build

EXPOSE 3000

CMD [ "node", "dist/main" ]
