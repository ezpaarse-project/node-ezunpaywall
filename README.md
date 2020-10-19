# node-ezunpaywall

> Tools for [ezunpaywall](https://github.com/ezpaarse-project/ez-unpaywall)

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
| update <list> [startLine] [endLine] (optionnal) | list of update files present in ez-unpaywall |
| update <file> [startLine] [endLine] (optionnal) | update the data with the update files present in ez-unpaywall with name |
| update <startDate> [endDate] (optionnal) | download, insert the update coming from unpaywall in a given period |
| reports <latest> [error/succes] (optionnal) | see the latest insert reports |
| reports <list> [error/succes] (optionnal) | list of insert reports |

## Commands details

### update

if you use "update" without parameter, it will download the last update published by unpaywall and insert its content.
for automated this, it is possible to call this command via a cron (
unpaywall publishes an update every Tuesday UTC-7)

### update -l --list

Displays the list of update files found in the server.
Select a file found in the list to insert its content.

#### Optionnal parameters

| Name | Type | Description |
| --- | --- | --- |
| -sl --startLine | Integer | line at which insertion begins |
| -el --endLine | Integer | line at which insertion ends |

Examples:
```bash
# insert all the content of the selected file on list
$ ezunpaywall update -l
# insert the content between line 1 000 and 400 000 of the selected file on list
$ ezunpaywall update -l -sl 1000 -el 400000
```

### update -f --file

insert the contents of the file according to the name of this one.

#### Optionnal parameters

| Name | Type | Description |
| --- | --- | --- |
| -sl --startLine | Integer | line at which insertion begins |
| -el --endLine | Integer | line at which insertion ends |

Examples:
```bash
# insert all the content of fils.json.gz
$ ezunpaywall -f ./file.jsonl.gz 
# insert the content between line 1 000 and 400 000 of fils.json.gz
$ ezunpaywall -f ./file.jsonl.gz -sl 1000 -el 400000
```

### update -sd --startDate

Downloads and inserts all updates from unpaywall during a given period. (startDate at now)

| Name | Type | Description |
| --- | --- | --- |
| -ed --endDate | Date YYYY-mm-dd | period end date |

Examples:
```bash
# Downloads and inserts all updates from unpaywall between 2020-04-27 and now
$ ezunpaywall -sd 2020-04-27
# Downloads and inserts all updates from unpaywall between 2020-04-27 and 2020-07-01 
$ ezunpaywall -sd 2020-04-27 -se 2020-07-01
```

### reports -la --latest

Displays the contents of latest update report on ezunpaywall

| Name | Type | Description |
| --- | --- | --- |
| '-s --status | String | status of file, either success either, error |

Examples:
```bash
# display the latest report
$ ezunpaywall report -la
# display the latest success report
$ ezunpaywall report -la -s success
# display the latest error report
$ ezunpaywall report -la -s error
```

### reports -l --list

Displays the list of update report on ezunpaywall.
Select a file found in the list to see its content.

| Name | Type | Description |
| --- | --- | --- |
| '-s --status | String | type of file, either success either, error |

Examples:
```bash
# display the list of all reports
$ ezunpaywall report -l
# display the list of success reports
$ ezunpaywall report -l -s success
# display the list of error reports
$ ezunpaywall report -l -s error
```

### enricher 

Enriched a file (JSON/CSV) with attributes unpaywall
by default, if no attributes is informed, we enriched with all attributes

Examples:
```bash
# enrich with all attributes
$ ezunpaywall enricher -f ./pathOfFile.json
# enrich only with oa_status and best_oa_location.url
$ ezunpaywall enricher -f ./pathOfFile.csv -a oa_status best_oa_location.url
```

To see all available unpaywall attributes, [click here](https://github.com/ezpaarse-project/ez-unpaywall/tree/master#object-structure)