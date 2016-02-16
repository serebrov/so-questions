#! /bin/bash

Xvfb :99 -ac -screen 0 1280x1024x16 &
echo 'Starting the test'
PATH=$PATH:. python selenimum_scrape.py
