#!/bin/bash

# Remove the output (if it's left from previous runs).
rm -r output
mkdir -p output

# Unzip the zip archive.
unzip data.zip -d output
# For rar use
#  unrar x data.rar output

for archive in output/folder/*.7z
do
  # See https://stackoverflow.com/questions/7148604
  # Get the list of file names, remove the extra output of "7z l"
  list=$(7z l "$archive" | awk '
      /----/ {p = ++p % 2; next}
      $NF == "Name" {pos = index($0,"Name")}
      p {print substr($0,pos)}
  ')
  # Get the list of files with [!].
  extract_list=$(echo "$list" | grep "[!]")
  if [[ -z $extract_list ]]; then
    # If we don't have files with [!], then look for ([A-Z]) pattern
    # to get files with single letter in brackets.
    extract_list=$(echo "$list" | grep "([A-Z])\.")
  fi
  if [[ -z $extract_list ]]; then
    # If we only have one file - extract it.
    if [[ ${#list[@]} -eq 1 ]]; then
      extract_list=$list
    fi
  fi
  if [[ ! -z $extract_list ]]; then
    # If we have files to extract, then do the extraction.
    # Output path is output/7zip_archive_name/
    out_path=output/$(basename "$archive")
    mkdir -p "$out_path"
    echo "$extract_list" | xargs -I {} 7z x -o"$out_path" "$archive" {}
  fi
done
