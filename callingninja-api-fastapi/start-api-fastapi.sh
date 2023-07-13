## <!-- Designed by Neftali Ramirez Chavez Julio 2023 nefkon@gmail.com -->
cd /usr/src/app/deployment/callingninja-api-fastapi/
sleep 20
python -m uvicorn callingninja:app --host 127.0.0.1 --port 80