###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .
RUN npm i -g dotenv-cli
RUN npm i
RUN npx prisma generate

RUN npm run build

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "dotenv", "-e", ".env.production", "node", "dist/main.js" ]