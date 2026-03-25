FROM node:22-alpine

WORKDIR /workspace

COPY package.json ./package.json
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN npm install

COPY apps/web ./apps/web
COPY packages/shared-types ./packages/shared-types

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace", "@opspilot/web", "--", "--hostname", "0.0.0.0", "--port", "3000"]
