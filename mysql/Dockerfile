##mysql 5.7 
##mysql 8
# FROM mysql:8.0

# FROM mysql:5.8
FROM mysql:5.7
MAINTAINER plusnetwork.com.mx
# setup the working directory
WORKDIR /
# add source code
COPY mysql.cnf /etc/mysql.cnf
COPY init-mysql.sh /init-mysql.sh
# COPY init.sql /init.sql
# COPY concentrador_gds_sabre_session_token.sql /concentrador_gds_sabre_session_token.sql
# COPY init-mysql.sh /init-mysql.sh
ENV PORT=3306
EXPOSE $PORT
USER root
# RUN mkdir /var/lib/mysql
# RUN chown -R mysql:mysql /var/lib/mysql

#ADD ./docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/
#RUN chown -R mysql:mysql /docker-entrypoint-initdb.d/
RUN chmod +x /init-mysql.sh
# RUN chmod +x /init.sql
# RUN chmod +x /concentrador_gds_sabre_session_token.sql

ENTRYPOINT ["/init-mysql.sh"]

#username="AgencyPage" password="HotelesVuelos$1" driverClassName="com.mysql.cj.jdbc.Driver"

#"jdbc:mysql://localhost:3306/concentrador_gds"

#RUN chmod +x /wait-for-it.sh
#RUN chmod +x /init-app.sh
#ADD src/ /go/src/nefkon8002.org/magazine/go.sum
#COPY init-app.sh /init-app.sh
#COPY wait-for-it.sh /wait-for-it.sh

#ADD /home/nefkon8002/gopath/src/nefkon8002.org/magazine/ /go/src/nefkon8002.org/magazine/
# build the source

# RUN cd /go/src/nefkon8002.org/magazine/ && \ 
#     go clean -modcache && \
#     go build ./...     && \
#     CGO_ENABLED=0 go build -ldflags "-s -w" -o gopherface -v gopherface.go

    # RUN cd /go/src/nefkon8002.org/magazine/ && \  
    #     go clean -modcache && \
    #     go mod download && \
        #CGO_ENABLED=0 GOOS=linux go build -a -o gopherface -v gopherface.go
       # CGO_ENABLED=0 go build -ldflags "-s -w" -o gopherface -v gopherface.go
#-installsuffix cgo    
# RUN chown -R www-data:www-data wp-content/ && \
#        chown www-data:www-data wp-config.php
# EXPOSE 81
# EXPOSE 10443
#RUN go build ./...

#RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o gopherface /go/src/nefkon8002.org/magazine/gopherface.go

# use a minimal alpine image
# FROM alpine:3.7
# # add ca-certificates in case you need them
# WORKDIR /
# RUN apk update && apk add ca-certificates bash && rm -rf /var/cache/apk/*
# # set working directory
# #WORKDIR /go/src/nefkon8002.org/magazine/
# # copy the binary from builder
# COPY --from=builder /go/src/nefkon8002.org/magazine/gopherface .
# COPY --from=builder /go/src/nefkon8002.org/magazine/conf /conf
# # COPY --from=builder /go/src/nefkon8002.org/magazine/gopherface /go/src/nefkon8002.org/magazine/gopherface
# # COPY --from=builder /go/src/nefkon8002.org/magazine/conf /go/src/nefkon8002.org/magazine/conf
# #COPY --from=builder /gopherface .
# #ADD init.sh /go/src/nefkon8002.org/magazine/init.sh
# COPY wait-for-it.sh /wait-for-it.sh
# COPY init-gopherface.sh /init-gopherface.sh
# COPY init-app.sh /init-app.sh
# ENV PORT=10445
# EXPOSE $PORT
# RUN chmod +x /init-gopherface.sh
# RUN chmod +x /wait-for-it.sh
# RUN chmod +x /init-app.sh
# ENTRYPOINT ["/init-app.sh"]

#RUN chmod +x init.sh
#CMD ["./init.sh"]
#COPY --from=builder /go/src/nefkon8002.org/magazine/.env . 
#ARG GOPHERFACE_APP_ROOT_WORKSPACE_V0=${GOPHERFACE_APP_ROOT_WORKSPACE_V1}
#ADD src/nefkon8002.org/magazine/conf/.env /go/src/nefkon8002.org/magazine/.env
# run the binary
#CMD ["./gopherface"]

#RUN docker run --rm -it -p 10445:10445 wp-subdomain-cv_gomagazine
#CMD ["./gopherface"] "-myargument=true"
#-v $(pwd)/conf/app.conf:/go/src/nefkon8002.org/magazine/conf/app.conf
#docker run --rm -it -p 10445:10445 -v /home/nefkon8002/docker/wp-subdomain-cv/src/nefkon8002.org/magazine/conf/app.conf:/go/src/nefkon8002.org/magazine/conf/app.conf wp-subdomain-cv_gomagazine
#EXPOSE 85
#EXPOSE 10445

# FROM golang:1.13-alpine AS build_base
# MAINTAINER plusnetwork360.com
# ADD $GOPATH/src/nefkon8002.org/magazine/ $GOPATH/src/nefkon8002.org/magazine/ 
# RUN apk update && apk add --no-cache --upgrade git bash openssh protobuf gcc libc-dev
# RUN export GO111MODULE=on
# RUN export GOFLAGS=-mod=vendor

# RUN git clone https://github.com/micro/examples.git 
# RUN go get -d -v github.com/micro/go-micro
# RUN mv $GOPATH/src/nefkon8002.org/ $GOPATH/src/nefkon8002.org/

#RUN wget -q https://micro.mu/install.sh -O - | /bin/bash
#RUN go get -d -u github.com/golang/protobuf/protoc-gen-go
#RUN go get -d -u github.com/micro/protoc-gen-micro
#RUN go get -d -v github.com/micro/micro
#/home/nefkon8002/gopath/src/github.com/micro/examples/go.sum
#/home/nefkon8002/gopath/src/github.com/micro/examples/go.mod
#RUN go get -u github.com/golang/protobuf/{proto,protoc-gen-go}
#RUN go get -v github.com/micro/examples
#=======+++=======+++=======+++=======+++=======+++=======+++=======+++=======+++
# FROM wordpress:latest AS build_base
# MAINTAINER plusnetwork360.com
# ADD servername.conf /etc/apache2/conf-available/ 
# ADD wp-config.php /var/www/html/ 
# RUN apt-get update && \
#     apt-get install -y  --no-install-recommends ssl-cert sendmail && \
#     rm -r /var/lib/apt/lists/* && \
#     a2enconf servername && \
#     a2enmod ssl && \
#     a2ensite default-ssl
# ADD wp-plugins/cf7-google-map /var/www/html/wp-content/plugins/cf7-google-map
# ADD wp-plugins/contact-form-7 /var/www/html/wp-content/plugins/contact-form-7
# ADD wp-plugins/facebook-for-woocommerce /var/www/html/wp-content/plugins/facebook-for-woocommerce
# ADD wp-plugins/flamingo /var/www/html/wp-content/plugins/flamingo
# ADD wp-plugins/go_pricing /var/www/html/wp-content/plugins/go_pricing
# ADD wp-plugins/insta-gallery /var/www/html/wp-content/plugins/insta-gallery

# ADD wp-themes/GymEdge3.5/gymedge/ /var/www/html/wp-content/themes/gymedge/
# RUN chown -R www-data:www-data wp-content/ && \
#        chown www-data:www-data wp-config.php
# EXPOSE 81
# EXPOSE 10443

#=======+++=======+++=======+++=======+++=======+++=======+++=======+++=======+++

#ADD wp-plugins/akismet /var/www/html/wp-content/plugins/akismet
#ADD wp-plugins/blogger-importer /var/www/html/wp-content/plugins/blogger-importer
#ADD wp-plugins/duplicator /var/www/html/wp-content/plugins/duplicator
#ADD wp-#plugins/instagram-feed /var/www/html/wp-content/plugins/instagram-feed
#ADD wp#-#plugins/instagram-feed-pro /var/www/html/wp-content/plugins/instagram-feed-pro
#ADD wp#-#plugins/jetpack /var/www/html/wp-content/plugins/jetpack
#ADD wp#-#plugins/mailchimp-for-woocommerce /var/www/html/wp-content/plugins/mailchimp-for-woocommerce
#ADD wp#-#plugins/rss-importer /var/www/html/wp-content/plugins/rss-importer
#ADD wp#-#plugins/void-visual-whmcs-element /var/www/html/wp-content/plugins/void-visual-whmcs-element
#ADD wp#-#plugins/wellexpo-core /var/www/html/wp-content/plugins/wellexpo-core
#ADD wp#-#plugins/wellexpo-instagram-feed /var/www/html/wp-content/plugins/wellexpo-instagram-feed
#ADD wp#-#plugins/wellexpo-twitter-feed /var/www/html/wp-content/plugins/wellexpo-twitter-feed
#ADD wp#-#plugins/woobooking243 /var/www/html/wp-content/plugins/woobooking243
#ADD wp#-#plugins/woocommerce-checkout-field-editor /var/www/html/wp-content/plugins/woocommerce-checkout-field-editor/
#ADD wp#-#plugins/woocommerce-customer-order-csv-export /var/www/html/wp-content/plugins/woocommerce-customer-order-csv-export/
#ADD wp#-#plugins/woocommerce-deposits /var/www/html/wp-content/plugins/woocommerce-deposits/
#ADD wp#-#plugins/woocommerce-force-sells /var/www/html/wp-content/plugins/woocommerce-force-sells/
#ADD wp#-#plugins/woocommerce-memberships /var/www/html/wp-content/plugins/woocommerce-memberships/
#ADD wp-#plugins/woocommerce-product-feeds /var/www/html/wp-content/plugins/woocommerce-product-feeds/
#ADD wp-#plugins/woocommerce-shipping-fedex /var/www/html/wp-content/plugins/woocommerce-shipping-fedex/
#ADD wp-#plugins/woocommerce-shipping-per-product /var/www/html/wp-content/plugins/woocommerce-shipping-per-product/
#ADD wp-plugins/woocommerce-shipping-usps /var/www/html/wp-content/plugins/woocommerce-shipping-usps/
#ADD wp-plugins/woocommerce-social-login /var/www/html/wp-content/plugins/woocommerce-social-login/
#ADD wp-plugins/woo-variation-swatches-pro /var/www/html/wp-content/plugins/woo-variation-swatches-pro/
#ADD wp-plugins/WPML4.2.2/AddOns/woocommerce-gateways-country-limiter/ /var/www/html/wp-content/plugins/woocommerce-gateways-country-limiter/
#ADD wp-plugins/woocommerce-booking/ /var/www/html/wp-content/plugins/woocommerce-booking/
#ADD wp-plugins/wpglobus-for-wpbakery-visual-composer /var/www/html/wp-content/plugins/wpglobus-for-wpbakery-visual-composer/



#EXPOSE 21

    #&& a2enconf php7.2-fpm \


	#&& a2enmod headers \

#&& a2enconf ssl-params \

 #&& a2dismod mpm_prefork \

    #&& a2dismod mpm_event \

    #&& a2enmod mpm_worker \

    #&& a2enmod proxy_fcgi \

    #&& a2enmod http2 \

    #&& a2enmod proxy \

    #&& a2enmod proxy_http \

    #&& a2enmod remoteip \

#FROM golang:1.13-alpine AS build_base
#MAINTAINER ironDev.com
#RUN apk update && apk add --no-cache --upgrade git bash openssh protobuf gcc libc-dev
#RUN export GO111MODULE=on
#RUN git clone https://github.com/micro/examples.git 
#RUN go get -d -v github.com/micro/go-micro
#RUN mv $GOPATH/examples $GOPATH/src/github.com/micro/

#RUN wget -q https://micro.mu/install.sh -O - | /bin/bash
#RUN go get -d -u github.com/golang/protobuf/protoc-gen-go
#RUN go get -d -u github.com/micro/protoc-gen-micro
#RUN go get -d -v github.com/micro/micro
#/home/nefkon8002/gopath/src/github.com/micro/examples/go.sum
#/home/nefkon8002/gopath/src/github.com/micro/examples/go.mod
#RUN go get -u github.com/golang/protobuf/{proto,protoc-gen-go}
#RUN go get -v github.com/micro/examples


