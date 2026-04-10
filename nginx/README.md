# lifesgstb-nginx

Docker base is derived from nginx:1.19.2-alpine docker image

&nbsp;

## Directories
| Dir / files | Description |
|-----|-------------|
| config | nginx configs are here, segegated by their intended env |
| config/dev | config for dev |
| docker-entrypoint.d | sh scripts that will be ran when container starts |
| docker-entrypoint.d/10-download-configs-from-s3.sh | script to download config from S3 |

&nbsp;

### Config file hierarchy
```
config/<env>
  |- nginx.conf
    |- common
```

__IMPORTANT:__ This directory structure will be preserved when copying to S3. When the container starts, all these will be copied from S3 to /etc/nginx.

## How to update the config
Make the changes to the repo and push it. There is a CodePipeline that will pick up the changes and deploy a new container
