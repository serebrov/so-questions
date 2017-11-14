#!/bin/bash

rm -r content
rm -r folder
rm data.zip
rm data.rar

mkdir -p folder
mkdir -p content/7z_1
mkdir -p content/7z_2
mkdir -p 'content/7z 3'
mkdir -p 'content/7z 4'

touch 'content/7z_1/(U) [!].txt'
touch 'content/7z_1/(J) [!].txt'
touch 'content/7z_1/(J).txt'
touch 'content/7z_1/(U).txt'
touch 'content/7z_1/(E).txt'
pushd content/7z_1
7z a ../../folder/7z_1.7z *.*
popd

touch 'content/7z_2/(J) [b1].txt'
touch 'content/7z_2/(J) [b2].txt'
touch 'content/7z_2/(J) [o1].txt'
touch 'content/7z_2/(J).txt'
pushd content/7z_2
7z a ../../folder/7z_2.7z *.*
popd

touch 'content/7z 3/(E) [!].txt'
touch 'content/7z 3/(J).txt'
touch 'content/7z 3/(U).txt'
pushd 'content/7z 3'
7z a '../../folder/7z 3.7z' *.*
popd

touch 'content/7z 4/test.txt'
pushd 'content/7z 4'
7z a '../../folder/7z 4.7z' *.*
popd

zip data.zip -r folder
rar a -r data.rar folder

# For each 7z archive:
# - Extract all files with [!] in name
#  - If [!] is not present in name, extract all files with (?) in name (? is any single letter)
