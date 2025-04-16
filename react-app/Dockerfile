#build stage
FROM node:20-alpine AS build

#set working directory
WORKDIR /app

#copy package.json and package-lock.json
COPY package*.json ./

#install dependencies
RUN npm ci

#copy the rest of the application
COPY . .

#build the application
RUN npm run build

#production stage
FROM nginx:alpine

#copy built files from the build stage to nginx
COPY --from=build /app/dist /usr/share/nginx/html

#copy nginx configuration for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

#create wrapper script to dynamically replace $PORT in nginx.conf
RUN echo '#!/bin/sh' > /docker-entrypoint.d/00-update-port.sh && \
    echo 'sed -i "s/\$PORT/$PORT/g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.d/00-update-port.sh && \
    chmod +x /docker-entrypoint.d/00-update-port.sh

#start nginx
CMD ["nginx", "-g", "daemon off;"]