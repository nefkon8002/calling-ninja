## <!-- Designed by Neftali Ramirez Chavez Julio 2023 nefkon@gmail.com -->
FROM node:14.21.1
MAINTAINER Neftali Ramirez Chavez <nefkon@gmail.com>
WORKDIR /usr/src/app/deployment/callingninja-api-multifile-uploader
COPY . ./
COPY start-api-multifile-uploader.sh /start-api-multifile-uploader.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /start-api-multifile-uploader.sh
RUN chmod +x /wait-for-it.sh
# RUN npm install && npm run-script build 
#RUN npm install

EXPOSE 1234

ENTRYPOINT ["/wait-for-it.sh"]