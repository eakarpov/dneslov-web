npm i
npm run build
cp -fr .next /var/www/dneslov-web
cp .env.production /var/www/dneslov-web/.env.production
cp -f dnesvlov-web.service /etc/systemd/system/dnesvlov-web.service
sudo systemctl daemon-reload
sudo systemctl restart dnesvlov-web.service