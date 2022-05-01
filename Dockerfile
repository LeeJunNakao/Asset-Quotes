FROM node:14-alpine as release

RUN apk --update --no-cache add git

# Setup app directory
WORKDIR /app

# Copy package spec
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production=true

# Copy application files
COPY . ./

# Build application
RUN yarn build

# Declare static environment variables
ARG PORT=1337

ENV NODE_ENV=production \
    PORT=${PORT}

# Declare ports
EXPOSE ${PORT}

# Declare command to run
CMD ["yarn", "start"]
