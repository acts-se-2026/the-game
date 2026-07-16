#!/bin/bash

set -e

cd src/backend
sudo docker build -t the-game-backend .
cd -

cd src/frontend
sudo docker build -t the-game-frontend .
cd -

sudo docker compose up -d
