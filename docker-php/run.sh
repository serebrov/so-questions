#! /bin/bash
docker build -t apache-foo-docker .
docker run -d -p 8080:80 -v $(pwd):/var/www/html --name apacheFoo apache-foo-docker
