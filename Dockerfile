FROM node:18-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm i

RUN npx prisma generate 

RUN npm run build

USER node

CMD ["node", "dist/main.js" ]