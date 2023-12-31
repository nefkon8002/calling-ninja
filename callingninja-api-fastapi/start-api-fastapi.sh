## <!-- Designed by Neftali Ramirez Chavez Julio 2023 nefkon@gmail.com -->
cd /usr/src/app/deployment/callingninja-api-fastapi/
sleep 20
# Development start
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
# Production start
#python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile=./certs/callingninja.xyz.key --ssl-certfile=./certs/callingninja.xyz.crt