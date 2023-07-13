# 
FROM python:3.10.12

WORKDIR /usr/src/app/deployment/callingninja-api-fastapi
COPY . ./
COPY start-api-fastapi.sh /start-api-fastapi.sh
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /start-api-fastapi.sh
RUN chmod +x /wait-for-it.sh
RUN pip install --no-cache-dir --upgrade -r /usr/src/app/deployment/callingninja-api-fastapi/requirements.txt

EXPOSE 80
ENTRYPOINT ["/wait-for-it.sh"]

# COPY ./requirements.txt /deployment/requirements.txt
# RUN pip install --no-cache-dir --upgrade -r /deployment/requirements.txt
# COPY ./callingninja.py /deployment/callingninja.py
# COPY ./src /deployment/src
# COPY .env /deployment/.env
# COPY config.env /deployment/config.env
# CMD ["python", "-m", "uvicorn", "callingninja:app", "--host", "127.0.0.1", "--port", "80"]