#!/bin/sh
# vim:sw=4:ts=4:et

set -e

# Download config from S3
aws s3 cp s3://${BUCKET_NAME}/ /etc/nginx/ --recursive;
