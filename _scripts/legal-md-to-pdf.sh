#!/bin/bash -e

#5718
# Purpose
# This bash script allows for the conversion of markdown files to pdfs. The purpose is to create a way for legal documents to be easily converted and made available for end-users.
#
# Usage
# The script requires that you have pandoc and LaTeX installed on your machine.
#    pandoc: https://github.com/jgm/pandoc/blob/master/INSTALL.md
#    LaTeX: https://www.latex-project.org/get/
# The script will check that pandoc is installed before asking you for the file or directory on your machine that you would like to be converted. If a directory is provided, then all markdown files within that folder will be convered. If a single file is provided, only that file will be converted.
# The resulting output will be stored within `assets/legal`.
#
# Examples:
# file provided to convert: `/Users/test/github/mozilla/legal-docs/firefox_cloud_services_ToS/en-US.md`
# resulting file: `assets/legal/firefox_cloud_services_ToS/en-US.pdf`
#
# directory provided to convert: `/Users/test/github/mozilla/legal-docs/firefox_cloud_services_ToS`
# resulting files: `assets/legal/firefox_cloud_services_ToS/*.pdf`


legalpath=
legaldoc=
fxapath=
tries=0
checkpandoc() {
  echo "Checking to see if 'pandoc' is installed..."
  if command -v pandoc >/dev/null; then
    echo "'pandoc' is installed.  Continuing."
  else
    echo "This script requires that pandoc be installed."
    echo "Please run 'brew install pandoc' or follow instructions here: https://github.com/jgm/pandoc/blob/master/INSTALL.md."
    echo "Exiting."
    exit 1
  fi
}

getlegalpath() {
  echo "Provide the absolute path to the legal directory containing the files to convert or the specific file to be converted."
  read -r path
  echo "You provided: '$path'"

  if [ -d "$path" ] || [ -f "$path" ]; then
    echo "'$path' is valid."
    legalpath=$path
  elif [ $tries -lt 3 ]; then
    echo "'$path' does not exist. Please try again."
    (( ++tries ))
  else
    echo "Too many tries. Exiting."
    exit 1
  fi
}

getfxapath() {
  path=$(pwd)
  fullpath="${path}/../assets/legal"


  if [ ! -d "$fullpath" ]; then
    echo "Unable to locate relative output base directory: ../assets/legal";
    echo "Exiting."
    exit
  fi

  if [ -f "$legalpath" ]; then
    legaldir=$(dirname "${legalpath}")
  else
    legaldir=$legalpath
  fi
  echo "legaldir: $legaldir"
  directoryname=${legaldir##*/}
  echo "directoryname: $directoryname"

  fxapath="${fullpath}/${directoryname}"

  if [ ! -d "$fxapath" ]; then
    mkdir $fxapath
  fi

  echo "Resulting pdfs will be created in the following directory: '$fxapath'"
}

convertfile(){
  filename=`basename $legaldoc .md`
  destination="${fxapath}/${filename}.pdf"
  echo "executing: pandoc $legaldoc -o $destination --pdf-engine=xelatex"
  pandoc $legaldoc -o $destination --pdf-engine=xelatex
}


echo "------------------"
echo " STARTING PROGRAM "
echo "------------------"
echo ""
checkpandoc
while [ -z "${legalpath}" ]; do
  echo ""
  getlegalpath
done
echo ""
getfxapath
echo ""
echo "---------------------------"
echo " BEGINNING FILE CONVERSION "
echo "---------------------------"
echo

if [ -f "$legalpath" ]; then
  legaldoc=$legalpath
  convertfile
else
  for legaldoc in $legalpath/*.md; do
      convertfile
  done
fi
