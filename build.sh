#!/bin/bash

set -e

sudo docker build -t the-game-0.01 .
cd src/frontend
npm install
npm run build
cd -
sudo docker compose up -d
