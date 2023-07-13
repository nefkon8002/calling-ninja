## <!-- Designed by Neftali Ramirez Chavez Julio 2023 nefkon@gmail.com -->
# FROM store/oracle/serverjre:1.8.0_241-b07
# FROM java:8
# FROM maven:3.9-ibmjava
FROM maven:3.3-jdk-8
# Maintainer
MAINTAINER Neftali Ramirez Chavez <nefkon@gmail.com>

# Set environment variable for Maven version
ENV MVN_VERSION 3.6.3

# Install packages
# Install Maven
# RUN yum install -y curl tar gzip && \
#     curl -fsSL http://archive.apache.org/dist/maven/maven-3/$MVN_VERSION/binaries/apache-maven-$MVN_VERSION-bin.tar.gz | tar xzf - -C /usr/share && \
#     mv /usr/share/apache-maven-$MVN_VERSION /usr/share/maven && \
#     ln -s /usr/share/maven/bin/mvn /usr/bin/mvn    
# ENV MAVEN_HOME /usr/share/maven

WORKDIR /usr/src/app/deployment/callingninja-api-user/
COPY . ./
# COPY hosts /etc/
COPY start-api-user.sh /start-api-user.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /start-api-user.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 8081

ENTRYPOINT ["/wait-for-it.sh"]

# CMD ["mvn"]




# FROM node:14.19.3
# WORKDIR /usr/src/app/kafka-workers
# COPY . ./
# COPY start-kafka-server.sh /start-kafka-server.sh
# COPY wait-for-it.sh /wait-for-it.sh
# RUN chmod +x /start-kafka-server.sh
# RUN chmod +x /wait-for-it.sh
# RUN npm install && npm run-script build 

# EXPOSE 8084

# ENTRYPOINT ["/wait-for-it.sh"]