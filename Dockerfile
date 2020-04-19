# Check out https://hub.docker.com/_/node to select a new base image
# Stage #1 Build the source code
FROM node:10-alpine as builder

# Fallback to install and compile bcrypt
# this command only can run with root user. so yeah, run it first :P
RUN apk --no-cache add --virtual builds-deps build-base python

# Install app dependencies
COPY . .
RUN yarn install

# Create dist folder for build
RUN mkdir -p dist

# Clean first then build
RUN yarn prebuild
RUN yarn build

# Stage #2, clean build image
FROM node:10-alpine

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Copy only `dist` folder from previous build (Stage #1)
COPY --chown=node --from=builder dist dist
COPY --chown=node --from=builder node_modules node_modules
COPY public public
COPY template template

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

ARG PORT=5000
ENV PORT=$PORT

ARG APP_SECRET=secret
ENV APP_SECRET=$APP_SECRET

# POSTGRESQL
ARG POSTGRES_DB=empower
ENV POSTGRES_DB=$POSTGRES_DB

ARG POSTGRES_HOST=localhost
ENV POSTGRES_HOST=$POSTGRES_HOST

ARG POSTGRES_PORT=5432
ENV POSTGRES_PORT=$POSTGRES_PORT

ARG POSTGRES_USER=postgres
ENV POSTGRES_USER=$POSTGRES_USER

ARG POSTGRES_PASSWORD=secret
ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# NODE MAILER
ARG MAILER_DRIVER=smtp
ENV MAILER_DRIVER=$MAILER_DRIVER

ARG MAILER_HOST=smtp.mailtrap.io
ENV MAILER_HOST=$MAILER_HOST

ARG MAILER_PORT=2525
ENV MAILER_PORT=$MAILER_PORT

ARG MAILER_USER=f349d20931be9a
ENV MAILER_USER=$MAILER_USER

ARG MAILER_PASSWORD=9b6e2f7525a41a
ENV MAILER_PASSWORD=$MAILER_PASSWORD

# Expose the port
EXPOSE ${PORT}

CMD [ "node", "dist/main" ]
