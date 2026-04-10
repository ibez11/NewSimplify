FROM 011325603507.dkr.ecr.ap-southeast-1.amazonaws.com/nginx:1.20.2-alpine

ENV BUCKET_NAME s3-s3-simplify-prd-nginx-config

# update the existing lib
# delete /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
# delete /docker-entrypoint.d/20-envsubst-on-templates.sh
RUN apk update \
&& apk upgrade \
&& rm /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh \
&& rm  /docker-entrypoint.d/20-envsubst-on-templates.sh

# Instal aws
RUN apk add -q aws-cli;

# ensure all the dir are there before updating permission and owner
RUN mkdir -p /var/cache/nginx \
&& mkdir -p /var/run/nginx \
&& mkdir -p /var/log/nginx

RUN chmod -R 755 /etc/nginx /var/cache/nginx /var/run/nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx /var/cache/nginx /var/run/nginx /var/log/nginx

USER nginx

COPY docker-entrypoint.d/10-download-configs-from-s3.sh /docker-entrypoint.d
