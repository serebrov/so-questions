# Change this to your repository url
BITBUCKET_URL=git@bitbucket.org:user/project 

# git clone git://git.kernel.org/pub/scm/git/git.git 
# git checkout v1.9.4
# make configure
# ./configure --prefix=/usr
# make all
# ./git --version
# # git version 1.9.4
# GIT194=./git/git
GIT194=git

$GIT194 --version

$GIT194 clone $BITBUCKET_URL project
# Cloning into 'project'...
# Warning: Permanently added the RSA host key for IP address 'xxx.xxx.xxx.xxx' to the list of known hosts.
# remote: Counting objects: 163, done.
# remote: Compressing objects: 100% (154/154), done.
# remote: Total 163 (delta 53), reused 0 (delta 0)
# Receiving objects: 100% (163/163), 3.62 MiB | 1.30 MiB/s, done.
# Resolving deltas: 100% (53/53), done.
# Checking connectivity... done.

mkdir mycopy
cd mycopy
git clone ../project .
# Cloning into '.'...
# done.
ls
# application.py  database.py  README.md  requirements.txt  static
git remote -v show
# origin	/home/seb/test/gitdist/mycopy/../project (fetch)
# origin	/home/seb/test/gitdist/mycopy/../project (push)

git remote rename origin local
git remote add origin $BITBUCKET_URL
git remote -v show
# local	/home/seb/test/gitdist/mycopy/../project (fetch)
# local	/home/seb/test/gitdist/mycopy/../project (push)
# origin	git@bitbucket.org:owner/project.git (fetch)
# origin	git@bitbucket.org:owner/project.git (push)

git pull origin
# Warning: Permanently added the RSA host key for IP address 'xxx.xxx.xxx.xxx' to the list of known hosts.
# From bitbucket.org:owner/project
#  * [new branch]      master     -> origin/master
# You asked to pull from the remote 'origin', but did not specify
# a branch. Because this is not the default configured remote
# for your current branch, you must specify a branch on the command line.
