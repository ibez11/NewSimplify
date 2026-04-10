#!/bin/sh
set -e

echo Retrieving env variables from "/simplify/${ENV}/backend/"

aws ssm get-parameters-by-path \
  --path "/simplify/${ENV}/backend/" \
  --with-decryption \
  --query "Parameters[*].[Name,Value]" \
  --output text |
  while read line
  do
    name=$(echo ${line} | cut -f 1 -d" " | sed -e "s?/simplify/${ENV}/backend/??g")
    value=$(echo ${line} | cut -f 2 -d" ")
    echo "${name}=${value}" >> /usr/src/app/.env
  done

echo /usr/src/app/.env file created
chown node:node /usr/src/app/.env

# From original docker-entrypoint.sh
if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

exec "$@"
