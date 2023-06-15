#!/usr/bin/env bash
# Use this script for initialization of micro 
# process arguments

#source wait-for-it.sh
#source init-micro.sh

WAITFORIT_cmdname=${0##*/}

usage()
{
    cat << USAGE >&2
Usage:

    $WAITFORIT_cmdname host:port [MYSQL] host:port [MONGO] host:port [REDIS]
    -h HOST | --host=HOST       Host or IP   Networking Across Any Cloud
    -p PORT | --port=PORT       TCP port     Networking Across Any Cloud
                                Alternatively, you specify the host and port as host:port
    -s | --service              Service API to connect Networking Across Any Cloud
USAGE
    exit 1
}

echoerr() { if [[ $WAITFORIT_QUIET -ne 1 ]]; then echo "$@" 1>&2; fi }

# total number of command-line arguments
echo "Total arguments passed are: $#"
# $* is used to show the command line arguments
echo "The arguments are: $*"
# echo "The First Argument is: $1"
# shift 
# echo "The Second Argument After Shift is: $1"
# shift 2
# echo "The Three Argument After Shift is: $1"


while [[ $# -gt 0 ]]
do
     case "$1" in
        *:* )
        WAITFORIT_hostport=(${1//:/ })
        WAITFORIT_HOST=${WAITFORIT_hostport[0]}
        WAITFORIT_PORT=${WAITFORIT_hostport[1]}
        echo "CASE_ONE $1 / $1 => $WAITFORIT_HOST:$WAITFORIT_PORT"

        # case "$WAITFORIT_HOST" in
        #     "mysqldb" )
        #     WAITFORIT_MYSQL_HOST=${WAITFORIT_hostport[0]}
        #     WAITFORIT_MYSQL_PORT=${WAITFORIT_hostport[1]}
        #       echo "CASE_MYSQL $1 / $1 => $WAITFORIT_MYSQL_HOST:$WAITFORIT_MYSQL_PORT"
        #     ##shift 1
        #     ;;
        #     "mongodb" )
        #     WAITFORIT_MONGO_HOST=${WAITFORIT_hostport[0]}
        #     WAITFORIT_MONGO_PORT=${WAITFORIT_hostport[1]}
        #       echo "CASE_MONGO $1 / $1 => $WAITFORIT_MONGO_HOST:$WAITFORIT_MONGO_PORT"
        #     ##shift 1
        #     ;;
        #     "redisdb" )
        #     WAITFORIT_REDIS_HOST=${WAITFORIT_hostport[0]}
        #     WAITFORIT_REDIS_PORT=${WAITFORIT_hostport[1]}
        #       echo "CASE_REDIS $1 / $1 => $WAITFORIT_REDIS_HOST:$WAITFORIT_REDIS_PORT"
        #     ##shift 1
        #     ;;
        # esac

        shift 1 ###shift se utiliza para recorrer los parametros de entrada
        ;;
        --service=*)
        WAITFORIT_SERVICE="${1#*=}"
        shift 1
        ;;
        -q | --quiet)
        WAITFORIT_QUIET=1
        shift 1
        ;;
        -y | --strict)
        WAITFORIT_STRICT=1
        shift 1
        ;;
        -p)
        WAITFORIT_PORT="$2"
        if [[ $WAITFORIT_PORT == "" ]]; then break; fi
        shift 2
        ;;
        --port=*)
        WAITFORIT_PORT="${1#*=}"
        shift 1
        ;;
        -t)
        WAITFORIT_TIMEOUT="$2"
        if [[ $WAITFORIT_TIMEOUT == "" ]]; then break; fi
        shift 2
        ;;
        --timeout=*)
        WAITFORIT_TIMEOUT="${1#*=}"
        shift 1
        ;;
        --)
        shift
        WAITFORIT_CLI=("$@")
        break
        ;;
        --help)
        usage
        ;;
        *)
        echoerr "Unknown 1 argument: $1"
        usage
        ;;
    esac
   
done
# if [[ "$REGISTRY_ADDRESS" == "" ]]; then
#     echoerr "Error: you need to provide a host and port to test."
#     usage
# fi

# echo "CASE MYSQL => $WAITFORIT_MYSQL_HOST:$WAITFORIT_MYSQL_PORT"
# echo "CASE MONGO => $WAITFORIT_MONGO_HOST:$WAITFORIT_MONGO_PORT"
# echo "CASE REDIS => $WAITFORIT_REDIS_HOST:$WAITFORIT_REDIS_PORT"


# if [[ "$WAITFORIT_MYSQL_HOST" == "" || "$WAITFORIT_MYSQL_PORT" == "" ]]; then
#     echoerr "Error: you need to provide a mysql host and port to test."
#     usage
# fi
# if [[ "$WAITFORIT_MONGO_HOST" == "" || "$WAITFORIT_MONGO_PORT" == "" ]]; then
#     echoerr "Error: you need to provide a mongo host and port to test."
#     usage
# fi
# if [[ "$WAITFORIT_REDIS_HOST" == "" || "$WAITFORIT_REDIS_PORT" == "" ]]; then
#     echoerr "Error: you need to provide a redis host and port to test."
#     usage
# fi

# echo "Argumento init-micro 1 " $WAITFORIT_HOST
# echo "Argumento init-micro 2 " $WAITFORIT_PORT 
# echo "Argumento init-micro 3 " $WAITFORIT_SERVICE 
#echo "Argumento init-micro 1 " $WAITFORIT_REGISTRY 
#www.google.com:81 --timeout=1 --strict -- echo "google is up"
# sudo service mysql start
# sudo service mysql stop
#cd /mysql
#usermod -d /var/lib/mysql/ mysql
#mysqld --user root &


# ----------------------------------------------------------------

# mysqld --log-bin=mysqldb-bin --user mysql 

# mysqld --datadir=/data/mysql/ --explicit_defaults_for_timestamp=1 --socket=/data/mysql/mysqld.lock  --bind-address=0.0.0.0 --pid-file=/data/mysql/mysqld.pid --log-bin=/data/mysql/logs/mysqlcdc --server-id=369 --log-bin-index=/data/mysql/logs/on.log --binlog-format=row --binlog-row-image=full

# mysqld --no-defaults --initialize --log-bin=mysqldb-bin --user mysql --explicit_defaults_for_timestamp=1   --bind-address=0.0.0.0 --server-id=369  --binlog-format=row --binlog-row-image=full

# mysql_upgrade

mysqld  --log-bin=mysqldb-bin --user mysql  --datadir=/var/lib/mysql --explicit_defaults_for_timestamp=1   --bind-address=0.0.0.0 --server-id=369  --binlog-format=row --binlog-row-image=full

# mysqld --log-bin=mysqldb-bin --user root --explicit_defaults_for_timestamp=1   --bind-address=0.0.0.0 --server-id=369  --binlog-format=row --binlog-row-image=full


# nsecure configuration for --pid-file: Location '/var/run/mysqld' in the path is accessible to all OS users. Consider choosing a different directory.



# mysqld --user mysql 

# ----------------------------------------------------------------
#sleep 10 ;

#service mysql start

#/etc/init.d/mysql start
#systemctl start mysqld
#echo "<================================ START initialization of MYSQL DB ================================>";
# mysql --defaults-extra-file=/home/mysql.cnf -e "CREATE DATABASE gopherfacedb"
# mysql --defaults-extra-file=/home/mysql.cnf -e "CREATE USER gopherface@localhost IDENTIFIED BY 'password'"
# mysql --defaults-extra-file=/home/mysql.cnf -e "CREATE USER gopherface@mysqldb IDENTIFIED BY 'password'"
# mysql --defaults-extra-file=/home/mysql.cnf -e "GRANT ALL PRIVILEGES ON gopherfacedb.* TO gopherface@localhost IDENTIFIED BY 'password'"
# mysql --defaults-extra-file=/home/mysql.cnf -e "GRANT ALL PRIVILEGES ON gopherfacedb.* TO gopherface@mysqldb IDENTIFIED BY 'password'"
# mysql --defaults-extra-file=/home/mysql.cnf -e "FLUSH PRIVILEGES"
# echo "<================================ FINISH initialization of MYSQL DB ================================>";
#source /init.sql
# mysql --defaults-extra-file=/mysql.cnf 
# mysql -e "CREATE DATABASE gopherfacedb"
# # #mysql -e "CREATE USER gopherface@localhost IDENTIFIED BY 'password'"
# mysql -e "CREATE USER gopherface@mysqldb IDENTIFIED BY 'password'"
# #mysql -e "GRANT ALL PRIVILEGES ON gopherfacedb.* TO gopherface@localhost IDENTIFIED BY 'password'"
# mysql -e "GRANT ALL PRIVILEGES ON gopherfacedb.* TO gopherface@mysqldb IDENTIFIED BY 'password'"
# mysql -e "FLUSH PRIVILEGES"
# echo "<================================ FINISH initialization of MYSQL DB ================================>";

#./mysql -u root -prootpwd   

#./go/src/nefkon8002.org/magazine/gopherface


##./micro --enable_tls --tls_cert_file=gopherfacecert.pem --tls_key_file=gopherfacekey.pem server


#echo "### ./micro --enable_tls=$MICRO_ENABLE_TLS --tls_cert_file=$MICRO_TLS_CERT_FILE --tls_key_file=$MICRO_TLS_KEY_FILE  "
#echo "### ./micro tls --enable_tls=$MICRO_ENABLE_TLS"
#sleep 5 ;
#(./micro server &)
#(./micro --enable_tls=$MICRO_ENABLE_TLS --tls_cert_file=$MICRO_TLS_CERT_FILE --tls_key_file=$MICRO_TLS_KEY_FILE &)
#./micro server 
# echo "### ./micro server & "
# sleep 5 ;
# echo "### login. . . . .";
# ./micro login --username admin --password micro
# sleep 5 ;

# sleep 5 ;

# echo "### ./micro --enable_tls=$MICRO_ENABLE_TLS --tls_cert_file=$MICRO_TLS_CERT_FILE --tls_key_file=$MICRO_TLS_KEY_FILE  &"
# #echo "### server ok "
# # (./micro api &)
# # echo "micro api ok "
# sleep 5 ;

# #sleep 5 ; 
# ./micro --registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT $WAITFORIT_SERVICE --handler=rpc 
# ./micro --enable_tls=$MICRO_ENABLE_TLS --tls_cert_file=$MICRO_TLS_CERT_FILE --tls_key_file=$MICRO_TLS_KEY_FILE
# echo "### ./micro --registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT $WAITFORIT_SERVICE --handler=rpc";
# echo "### registry ok "

# #./micro --registry=$WAITFORIT_HOST --registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT --register_interval=5 --register_ttl=10  $WAITFORIT_SERVICE --address=0.0.0.0:8080
#echo "### micro --registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT $WAITFORIT_SERVICE";
 #./micro $WAITFORIT_SERVICE

#( ./micro --registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT $WAITFORIT_SERVICE )

#( ./micro --registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT $WAITFORIT_SERVICE )



 #./micro --registry=consul --registry_address=consul:8500 --register_interval=5 --register_ttl=10  api --address=0.0.0.0:8080


# #--register_interval=5 --register_ttl=10 $WAITFORIT_SERVICE --address=0.0.0.0:8080

# echo "### micro run    github.com/micro/services/helloworld";
# (./micro run github.com/micro/services/helloworld)
# sleep 5 ; 
# echo "### micro status github.com/micro/services/helloworld";
# ./micro status
# sleep 5 ; 
# echo "### micro logs   github.com/micro/services/helloworld";
# ./micro logs helloworld
#sleep 5 ; 
#(./micro --registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT $WAITFORIT_SERVICE --handler=rpc)
#sleep 5 ; 
#(--registry_address=$WAITFORIT_HOST:$WAITFORIT_PORT $WAITFORIT_SERVICE --handler=rpc )



#(./micro --registry_address=consul:8500 api --handler=rpc  echo "### execute registering consul:8500 in background")
#echo "<================================ end   initialization micro ================================>";

# &&
# ./micro login --username admin --password micro  

# &&
# ./micro --registry_address=consul:8500 api --handler=rpc
# set -eu
 
# echo "Checking DB connection ..."
 
# i=0
# until [ $i -ge 10 ]
# do
#   nc -z mysqldb 3306 && break #nc -z app-db 3306 && break
 
#   i=$(( i + 1 ))
 
#   echo "$i: Waiting for DB 1 second ..."
#   sleep 1

# done
 
# if [ $i -eq 10 ]
# then
#   echo "DB connection refused, terminating ..."
#   echo "STARTING GOPHERFACE>>>>>>>>>>>>>>> ..."
#   /go/src/nefkon8002.org/magazine/gopherface
#   exit 1
# fi
 
# echo "DB is up ..."
# /go/src/nefkon8002.org/magazine/gopherface