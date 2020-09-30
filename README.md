# node-ezunpaywall

> Tools for ezMESURE administration

## Configuration
| Env. var | Description |
| --- | --- |
| NODE_EZUNPAYWALL_URL | ez-unpaywall url |
| NODE_EZUNPAYWALL_PORT | ez-unpaywall port |

## Global options

| Name | Type | Description |
| --- | --- | --- |
| -V, --version | Boolean | Print the version number |
| -h, --help | Boolean | Show some help |

You can get help for any command by typing `node-ezunpaywall <command> --help`.

## Command line usage

The module provides an `ezunpaywall` command (aliased `ezu`).

## Commands

| Name | Description |
| --- | --- |
| [update] <list> [startLine] [endLine] (optionnal) | list of update files present in ez-unpaywall |
| [update] <file> [startLine] [endLine] (optionnal) | update the data with the update files present in ez-unpaywall with name |
| [update] <startDate> [endDate] (optionnal) | download, insert the update coming from unpaywall in a given period |
| [reports] <latest> [error/succes] (optionnal) | see the latest insert reports |
| [reports] <list> [error/succes] (optionnal) | list of insert reports |

## Commands details

### update -l --list

Displays the list of update files found in the server.
Select a file found in the list to insert its content.

#### Optionnal parameters

| Name | Type | Description |
| --- | --- | --- |
| -sl --startLine | Integer | line at which insertion begins |
| -el --endLine | Integer | line at which insertion ends |

Examples :
```bash
$ ezunpaywall update -l
$ ezunpaywall update -l -sl 1000 -el 100000
```

### update -f --file

insert the contents of the file according to the name of this one.

#### Optionnal parameters

| Name | Type | Description |
| --- | --- | --- |
| -sl --startLine | Integer | line at which insertion begins |
| -el --endLine | Integer | line at which insertion ends |

Examples :
```bash
$ ezunpaywall -f changed_dois_with_versions_2020-04-14T080001_to_2020-04-23T080001.jsonl.gz 
$ ezunpaywall -f changed_dois_with_versions_2020-04-14T080001_to_2020-04-23T080001.jsonl.gz -sl 1000 -el 100000
```

### update -sd --startDate

Downloads and inserts all updates from unpaywall during a given period. (startDate at now)

| Name | Type | Description |
| --- | --- | --- |
| -ed --endDate | Date YYYY-mm-dd | period end date |

Examples :
```bash
$ ezunpaywall -sd 2020-04-27
$ ezunpaywall -sd 2020-04-27 -se 2020-09-01
```

### reports -la --latest

Displays the contents of latest update report on ezunpaywall

| Name | Type | Description |
| --- | --- | --- |
| '-s --status | String | status of file, either success either, error |

Examples :
```bash
$ ezunpaywall report -la
$ ezunpaywall report -la -s success
$ ezunpaywall report -la -s error
```

### reports -l --list

Displays the list of update report on ezunpaywall.
Select a file found in the list to see its content.

| Name | Type | Description |
| --- | --- | --- |
| '-s --status | String | type of file, either success either, error |

Examples :
```bash
$ ezunpaywall report -l
$ ezunpaywall report -l -s success
$ ezunpaywall report -l -s error
```
