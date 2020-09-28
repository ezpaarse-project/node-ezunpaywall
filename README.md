# node-ezunpaywall

> Tools for ezMESURE administration

## Global options

| Name | Type | Description |
| --- | --- | --- |
| -V, --version | Boolean | Print the version number |
| -h, --help | Boolean | Show some help |

You can get help for any command by typing `node-ezunpaywall <command> --help`.

## Configuration

| Env. var | Description |
| --- | --- |

## Commands

| Name | Description |
| --- | --- |
| [update] <list> [startLine] [endLine] (optionnal) | list of update files present in ez-unpaywall |
| [update] <file> [startLine] [endLine] (optionnal) | update the data with the update files present in ez-unpaywall with name |
| [update] <startDate> [endDate] (optionnal) | download, insert the update coming from unpaywall in a given period |

| [reports] <latest> [error/succes] (optionnal) | see the latest insert reports |
| [reports] <list> [error/succes] (optionnal) | list of insert reports |
