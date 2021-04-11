#!/bin/bash
npm config set cache /var/www/.npm-cache --global
cd /var/www/frontend && npm install
npm start
