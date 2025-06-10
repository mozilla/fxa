## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
  .message = Downloaded
datablock-copy =
  .message = Copied
datablock-print =
  .message = Printed

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
  { $count ->
      [one]  Code copied
      *[other] Codes copied
  }

datablock-download-success =
  { $count ->
      [one]  Code downloaded
      *[other] Codes downloaded
  }

datablock-print-success =
  { $count ->
      [one]  Code printed
      *[other] Codes printed
  }

##
