## <!-- Designed by Neftali Ramirez Chavez Julio 2023 nefkon@gmail.com -->
cd /usr/src/app/deployment/callingninja-api-fastapi/
sleep 20
python -m uvicorn callingninja:app --host 0.0.0.0 --port 8000 --ssl-keyfile=./certs/callingninja.xyz.key --ssl-certfile=./certs/callingninja.xyz.crt