#!/usr/bin/env bash
# set -x
set -e

SCRIPT_PATH=`dirname $0`
ROOT=$(pwd)
USER_HOME=$HOME
USER_NAME=$USER

# source $SCRIPT_PATH/utils.sh
SERVICE_NAME=caspertest

#Install init.d scripts
script=$SCRIPT_PATH/$SERVICE_NAME
echo "Installing init.d script: $script"
script_name=$(basename $script)
sudo cp -f $script /etc/init.d/$SERVICE_NAME
sudo chmod 0755 /etc/init.d/$SERVICE_NAME
# sudo chkconfig --add $script_name
# sudo chkconfig $script_name on
sudo sed -e "s?%USER_HOME%?$USER_HOME?g" --in-place /etc/init.d/$SERVICE_NAME
sudo sed -e "s?%USER_NAME%?$USER_NAME?g" --in-place /etc/init.d/$SERVICE_NAME
sudo sed -e "s?%NAME%?$SERVICE_NAME?g" --in-place /etc/init.d/$SERVICE_NAME
sudo sed -e "s?%ROOT%?$ROOT?g" --in-place /etc/init.d/$SERVICE_NAME
echo "Installed init.d script: $script_name"
sudo service $SERVICE_NAME stop
sudo service $SERVICE_NAME start
