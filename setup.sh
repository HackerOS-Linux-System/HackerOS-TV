#!/bin/bash

sudo apt install python3-flask

#clonned repo
cd /HackeOS-TV
python3 -m venv venv
source venv/bin/activate
pip install flask-wtf #if not installed flask use pip install flask
#start-app 
/location/to/repo/HackerOS-TV-Launch.sh
