## <!-- Designed by Neftali Ramirez Chavez Julio 2023 nefkon@gmail.com -->
cd /usr/src/app/deployment/callingninja-api-multifile-uploader/
# node server.js
# "dev": "concurrently -k \"tsc -w\" \"nodemon --on-change-only dist/server.js\"",
# npx pm2-runtime start pm2.yaml
    # "startAll": "tsc --build && pm2 start ecosystem.config.js",
#
#"npm run-script build && node out/src/server.js"
sleep 20
# npm run startWorker01
# npm run startScheduler &
# npm run startWorker &
# pm2 start ecosystem.config.js --log-type json
# npm run  _startScheduler & 
npm run  start_production_server