#!/bin/bash

rm -r output
mkdir -p output/zip
unzip data.zip -d output/zip

for archive in output/zip/folder/*.7z
do
  # https://stackoverflow.com/questions/7148604/extract-list-of-file-names-in-a-zip-archive-when-unzip-l
  # Get the list of file names, remove the extra output of "7z l"
  list=$(7z l $archive | awk '
      /----/ {p = ++p % 2; next}
      $NF == "Name" {pos = index($0,"Name")}
      p {print substr($0,pos)}
  ')
  echo "Input " "$list"
  # Get the list of files with [!].
  extract_list=$(echo "$list" | grep "[!]")
  if [[ ! -z $extract_list ]]; then
    echo 'Exclamation files: '
    echo "$extract_list"
  else
    # If we don't have files with [!], look for ([A-Z]) pattern
    # to get files with single letter in brackets.
    echo 'Alternative files: '
    extract_list=$(echo "$list" | grep "([A-Z])\.")
    echo "$extract_list"
  fi
  if [[ ! -z $extract_list ]]; then
    # Wrap each file name into quotes and convert the list into one line
    # extract_list=$(echo "$extract_list" | awk '{print "\""$0"\""}' | awk 'ORS=" "')
    out_path=output/zip/$(basename $archive)
    mkdir -p $out_path
    echo "$extract_list" | xargs -I {} 7z x -o$out_path $archive {}
  fi
done

mkdir -p output/rar
unrar x data.rar output/rar
# .. similar to above
