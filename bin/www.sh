#!/bin/bash

redis-server /redis/redis.conf
mongod -f /etc/mongodb.conf
cd ..; node app.js
