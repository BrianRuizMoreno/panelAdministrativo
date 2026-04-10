#!/bin/bash

cat << 'EOF' > /opt/panel-admin/docker-compose.yml
version: '3.8'

networks:
  BolsaDeCafeNet:
    external: true

services:
  web:
    image: nginx:alpine
    networks:
      - BolsaDeCafeNet
    volumes:
      - /var/www/contactos.bolsadecafe.cloud:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    deploy:
      labels:
        - "traefik.enable=true"
        # HTTP Router - for Redirection
        - "traefik.http.routers.paneladmin-http.rule=Host(`contactos.bolsadecafe.cloud`)"
        - "traefik.http.routers.paneladmin-http.entrypoints=web"
        - "traefik.http.routers.paneladmin-http.middlewares=redirect-to-https"
        # Middleware definition
        - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
        # HTTPS Router
        - "traefik.http.routers.paneladmin.rule=Host(`contactos.bolsadecafe.cloud`)"
        - "traefik.http.routers.paneladmin.entrypoints=websecure"
        - "traefik.http.routers.paneladmin.tls.certresolver=letsencryptresolver"
        - "traefik.http.services.paneladmin.loadbalancer.server.port=80"
        - "traefik.docker.network=BolsaDeCafeNet"
EOF

cat << EOF > /opt/panel-admin/nginx.conf
server {
    listen 80;
    server_name contactos.bolsadecafe.cloud;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

cd /opt/panel-admin
docker stack deploy -c docker-compose.yml paneladmin
