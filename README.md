[![pullreminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)

## Firefox Accounts

The Firefox Accounts (fxa) monorepo

### Table of Contents

[Getting Started](#getting-started)\
[Contributing](#contributing)\
[Documentation](#documentation)
[Documentation for Scripts](#documentation-for-scripts)

---

### Getting Started

Please read [our documentation](https://mozilla.github.io/ecosystem-platform/tutorials/development-setup)

---

### Contributing

See the separate [CONTRIBUTING.md](https://github.com/mozilla/fxa/blob/main/CONTRIBUTING.md) to learn how to contribute.

---

### Documentation

The [Firefox Ecosystem Platform](https://mozilla.github.io/ecosystem-platform/) serves as a documentation hub for Firefox Accounts and Subscription Platform.

---

### Documentation for Scripts

#### \_scripts/legal-md-to-pdf.sh

##### Purpose

This bash script converts markdown documents into pdfs. The purpose is to provide an efficient way for Mozilla VPN legal documents to be converted and made available to end-users.

##### Usage

_Pre-requisites_: The script requires the following:

- Local copy of Mozilla legal-docs repo: https://github.com/mozilla/legal-docs
- pandoc: https://github.com/jgm/pandoc/blob/master/INSTALL.md
- LaTeX: https://www.latex-project.org/get/

##### To Run:

```bash
# from root fxa directory
_scripts/legal-md-to-pdf.sh '/absolute/path/to/legal-docs/'
```

The script traverses the legal-docs directory looking for localized copies of the Mozilla VPN legal documents. When found, the script converts the document from .md to .pdf and writes it to `assets/legal/<document_name>.<locale>.pdf`.

Example:
directory provided: `/Users/test/github/mozilla/legal-docs/`
resulting file: `assets/legal/<document_name>.<locale>.pdf`

test01
