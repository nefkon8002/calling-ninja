## <!-- Designed by Neftali Ramirez Chavez Julio 2023 nefkon@gmail.com -->
FROM node:14.19.3
MAINTAINER Neftali Ramirez Chavez <nefkon@gmail.com>
WORKDIR /usr/src/app/deployment/callingninja-ui-web/
COPY . ./
COPY start-ui-web.sh /start-ui-web.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /start-ui-web.sh
RUN chmod +x /wait-for-it.sh
RUN npm install -g @angular/cli@13.2.6 --save
RUN npm install
EXPOSE 8080
EXPOSE 4200
ENTRYPOINT ["/wait-for-it.sh"]
