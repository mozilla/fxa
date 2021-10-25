#!/bin/bash -e

#5718
# Purpose
# This bash script converts markdown documents into pdfs.
# The purpose is to provide an efficient way for Mozilla VPN legal documents to be easily converted and made available to end-users.
#
# Usage
# The script requires the following:
#    Local copy of Mozilla legal-docs repo: https://github.com/mozilla/legal-docs
#    pandoc: https://github.com/jgm/pandoc/blob/master/INSTALL.md
#    LaTeX: https://www.latex-project.org/get/
#
# The script traverses the legal-docs directory looking for Mozilla VPN legal documents in each locale.
# When found, the script converts the document from .md to .pdf and writes it to assets/legal/<document_name>.<locale>.pdf
#
# Examples:
# directory provided: `/Users/username/Documents/GitHub/legal-docs/`
# resulting file: `assets/legal/<document-name>.<locale>.pdf`

set -o errexit

documents_to_convert=(
  mozilla_vpn_privacy_notice.md
  mozilla_vpn_tos.md
  firefox_relay_tos.md
  firefox_relay_privacy_notice.md
)

legal_docs_path=""
invalid_paths=0

exit_converter() {
  echo ""
  echo "Exiting"
  echo ""
  exit 1
}

warn_invalid() {
  (( ++invalid_paths ))
  path=${1}
  message=${2}
  echo ""
  echo ""
  echo ">> ${message}"
  echo ">> '${path}' is invalid"
}

# Verify pandoc availability
if !  command -v pandoc >/dev/null; then
  echo ""
  echo ""
  echo "This script requires that pandoc be installed."
  echo "Please run 'brew install pandoc' or follow instructions here: https://github.com/jgm/pandoc/blob/master/INSTALL.md."
  exit_converter
fi

# Exit converter if path to legal-docs isn't provided
if [ $# -eq 0 ]; then
  echo ""
  echo "Please provide absolute path to Mozilla legal-docs directory"
  echo "Usage: _scripts/legal-md-to-pdf.sh 'absolute/path/to/legal-docs/'"
  echo ""
  echo "Mozilla legal-docs repo: https://github.com/mozilla/legal-docs"
  exit_converter
fi

# Append "/" to legal_docs_path if necessary
legal_docs_path=${1}
if [ ${legal_docs_path: -1} != "/" ]; then
  legal_docs_path=${legal_docs_path}/
fi

# Confirm legal-docs directory exists
if ! [ -d "$legal_docs_path" ]; then
  warn_invalid $legal_docs_path "Please provide a valid absolute path to the Mozilla legal-docs directory"
fi

# Confirm output directory exists
fxa_legal_assets="$(pwd)/assets/legal"
if [ ! -d "${fxa_legal_assets}" ]; then
  warn_invalid $fxa_legal_assets "Unable to locate relative output base directory: ../assets/legal"
fi

# Exit converter if both paths are not valid
if [ ${invalid_paths} -ne 0 ]; then
  exit_converter
fi

echo ""
echo ""
printf "$(tput bold)Starting: Mozilla VPN legal docs converter...$(tput sgr0) \n"
echo "This script converts Mozilla VPN legal documents from .md to .pdf"
echo "Resulting pdfs will be created in the following directory: '${fxa_legal_assets}'"
echo ""
echo ""

num_files_converted=0

for locale_dir in ${legal_docs_path}*; do
  for document in ${documents_to_convert[@]}; do
    if [ -f "${locale_dir}/${document}" ]; then
      locale=${locale_dir##*/}

      document_name="$(basename ${document} .md)"
      doc_to_convert="${locale_dir}/${document_name}.md"

      pdf="${fxa_legal_assets}/${document_name}.${locale}.pdf"
      echo ""
      echo "Converting ${locale}/${document_name}.md to legal/${document_name}.${locale}.pdf..."
      pandoc ${doc_to_convert} -o ${pdf} --pdf-engine xelatex
      (( ++num_files_converted ))
    fi
  done
done

echo ""
echo ""
printf "Done! ${num_files_converted} files converted to PDF! \n"
echo ""
echo ""
