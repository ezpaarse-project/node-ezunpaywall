# node-ezunpaywall
> Tools for [ezunpaywall](https://github.com/ezpaarse-project/ez-unpaywall)
**Table of content**
- [Prerequisites](#prerequisites)
- [Installation](#Installation)
- [Development](#Development)
- [Commands](#Commands)
  - [config](#config)
  - [ping](#ping)
  - [update-job-file](#config)
  - [update-job-period](#update-job-period)
  - [update-job-snapshot](#update-job-snapshot)
  - [update-report](#update-report)
  - [update-status](#update-status)
  - [enrich](#enrich)
  - [apikey-create](#apikey-create)
  - [apikey-update](#apikey-update)
  - [apikey-delete](#apikey-delete)
  - [apikey-get](#apikey-get)
- [Test](#Test)
## Prerequisites

The tools you need to let node-ezunpaywall run are :
* git >= 2.27.0
* npm >= 6.14.8
* NodeJS >= 14.15.0
## Installation

```bash
$ git clone https://github.com/ezpaarse-project/node-ezunpaywall.git
$ cd node-ezunaywall
$ npm i -g .
```
## Development

```bash
$ git clone https://github.com/ezpaarse-project/node-ezunpaywall.git
$ cd node-ezunpaywall
$ npm i
```
## Commands

You can get help for any command by typing `ezu <command> --help`.

The module provides an `ezunpaywall` command (aliased `ezu`).

| Name | Description |
| --- | --- |
| config [options] | config management command to establish the connection between the command and ezunpaywall |
| ping | check if services are available |
| update-job-file [options] | insert the content of changefile installed on ezunpaywall |
| update-job-period [options] | start an unpaywall data update process |
| update-job-snapshot [options] | download and insert the current snapshot |
| update-report [options] | get report of update process |
| update-status [options] | get status of update process |
| enrich [options] | enrich file with unpaywall attributes |
| apikey-create [options] | create new apikey |
| apikey-update [options] | update apikey |
| apikey-delete [options] | delete apikey |
| apikey-get [options] | get config of apikey |
| help [command] | display help for command |
### config
Manage config to fetch ezunpyawall.
#### Parameters
| Name | Description |
| --- | --- |
| --get | display the configuration |
| --set \<key> \<value> | update config |
| -L --list | list of attributes required for configuration |
| -h, --help | display help for command |
#### Examples

```bash
$ ezunpaywall config -L
```

```
baseURL
apikey
redisPassword
```

```bash
ezunpaywall config --set baseURL https://localhost.test.fr
```

```bash
{
  "baseURL": "https://localhost.test.fr",
  "apikey": "admin",
  "redisPassword": "changeme"
}
info: from /home/user/.config/ezunpaywall.json
```
### ping
Check if services are available.
#### Parameters
| Name | Description |
| --- | --- |
| -u --use | Use a custom config |
#### Example
```bash
ezunpaywall ping

info: Ping graphql service: OK
info: Ping update service: OK
info: Ping enrich service: OK
info: Ping apikey service: OK
info: ezmeta: OK
info: You have access to graphql, enrich, update service(s)
```
---
### update-job-file

insert the content of changefile installed on ezunpaywall
#### Parameters

| Name | Description |
| --- | --- |
| --file <file> | snapshot's file installed on ezunpaywall |
| --offset | line where processing will start |
| --limit | line where processing will end |
| -L --list | list of snapshot installed on ezunpaywall |
| -I --index | name of the index to which the data is inserted |
| -h, --help | display help for command |

#### Example

```bash
ezu update-job-file --file fake1.jsonl.gz

info: Insert "fake1.jsonl.gz"
```

---
### update-job-period

start an unpaywall data update process
#### Parameters

| Name | Description |
| --- | --- |
| --force | force update without check if is already installed |
| --startDate \<startDate> | start date to download and insert updates from unpaywall |
| --endDate  \<endDate> | end date to download and insert updates from unpaywall |
| --interval \<interval> | interval of update (day or week) |
| -L --list | list of snapshot installed on ezunpaywall |
| -I --index  | name of the index to which the data is inserted |
| | |

```bash
ezu update-job-period --startDate 2021-12-01 --endDate 2021-12-07

info: Insert "day" changefiles between "2021-12-01" and "2021-12-07"
```

```bash
ezu update-job-period --period week --startDate 2021-12-01 --endDate 2021-12-07

info: Insert "week" changefiles between "2021-12-01" and "2021-12-07"
```
---
### update-job-snapshot

download and insert the current snapshot
#### Parameters

| Name | Description |
| --- | --- |
| -I --index  | name of the index to which the data is inserted |
| | |

```bash
ezu update-job-snapshot

info: Insert current snapshot
```

---
### update-report

get report of update process

#### Parameters

| Name | Description |
| --- | --- |
| --file \<interval> | changefile installed on ezunpaywall |
| --latest | latest report |
| -L --list | list of snapshot installed on ezunpaywall |
| -I --index  | name of the index to which the data is inserted |
| | |

#### Examples


```bash
ezu update report -L

? reports (Use arrow keys)
❯ report1.json
  report2.json
  report3.json

{
  "done": true,
  "createdAt": "2021-07-23T08:13:40.802Z",
  "endAt": "2021-07-23T08:13:40.902Z",
  "steps": [
    {
      "task": "insert",
      "file": "fake1.jsonl.gz",
      "linesRead": 50,
      "percent": 100,
      "took": 0.084,
      "status": "success"
    }
  ],
  "error": false,
  "took": 0.100
}
```

```bash
ezu update report --latest

{
  "done": true,
  "createdAt": "2021-07-23T08:13:40.802Z",
  "endAt": "2021-07-23T08:13:40.902Z",
  "steps": [
    {
      "task": "insert",
      "file": "fake1.jsonl.gz",
      "linesRead": 50,
      "percent": 100,
      "took": 0.084,
      "status": "success"
    }
  ],
  "error": false,
  "took": 0.100
}
```

---
### update-status

get status of update process

#### Parameters

| Name | Description |
| --- | --- |
| --verbose | show with load bard |
| | |

#### Example

```bash
ezu update status

info: An update is being done
{
  "state": {
    "done": false,
    "createdAt": "2021-07-23T08:13:38.334Z",
    "endAt": null,
    "steps": [
      {
        "task": "getChangefiles",
        "took": 0.012,
        "status": "success"
      },
      {
        "task": "insert",
        "file": "fake3.jsonl.gz",
        "linesRead": 0,
        "percent": 0,
        "took": 0,
        "status": "inProgress"
      }
    ],
    "error": false
  }
}
```

or

```bash
ezu update status

info: No update is in progress
info: Use ezu update report --latest to see the latest report
```
---
### enrich

enrich file with unpaywall attributes
#### Parameters

| Name | Description |
| --- | --- |
| --file \<file> | file wich must be enriched |
| --separator <separator> | separator of csv file |
| --attributes <attributes>  | attributes which must be enriched in graphql format. By default all attributes are added |
| --out <out> | name of enriched file. By default, the output file is named: out.jsonl / out.csv |
| --verbose | display loadbar and exit if process end |
| -I --index  | name of the index to which the data is inserted |
| | |

#### Examples

```bash
ezu enrich job --file mustBeEnrich.csv --separator ";"

ezu enrich job --file mustBeEnrich.jsonl --separator ";" --attributes "{ is_oa, best_oa_location { license }, z_authors{ family } }"
```

---
### apikey-create

create new apikey

#### Parameters

| Name | Description |
| --- | --- |
| --keyname <keyname> | name of apikey |
| --access <access> | name of access services of apikey seperated by comma. By default it set at ['graphql'] |
| --attributes <attributes>  | unpaywall attributes seperated apikey seperated by comma. By default it set at '*' |
| --allowed <allowed> | indicates if the key is authorized or not. "true" or "false" only. By default it set at true |
| | |

#### Example

```bash
ezu apikey-create --keyname user1

{
  "apikey": "abcd1",
  "config": {
    "name": "user1",
    "access": [
      "graphql"
    ],
    "attributes": ["*"],
    "allowed": true
  }
}
```

```bash
ezu apikey-create --keyname user2 --access graphql,enrich,update --allowed false --attributes doi,is_oa

{
  "apikey": "abcd2",
  "config": {
    "name": "user2",
    "access": [
      "graphql",
      "enrich",
      "update"
    ],
    "attributes": ["doi", "is_oa"],
    "allowed": false
  }
}
```

---
### apikey-update

update apikey

#### Parameters

| Name | Description |
| --- | --- |
| --apikey <apikey> | apikey |
| --keyname <keyname> | name of apikey |
| --access <access> | name of access services of apikey seperated by comma. By default it set at ['graphql'] |
| --attributes <attributes>  | unpaywall attributes seperated apikey seperated by comma. By default it set at '*' |
| --allowed <allowed> | indicates if the key is authorized or not. "true" or "false" only. By default it set at true |
| | |

#### Example

```bash
ezu apikey-update --apikey demo --keyname updated-demo --access graphql --attributes doi,is_oa

{
  "apikey": "demo",
  "config": {
    "name": "updated-demo",
    "access": [
      "graphql"
    ],
    "attributes": ["doi","is_oa"],
    "allowed": true
  }
}
```
---

### apikey-delete

delete apikey

| Name | Description |
| --- | --- |
| --apikey <apikey> | apikey |
| | |

#### Example

```bash
apikey-delete --apikey demo

info: apikey [demo] is deleted successfully
```

---
### apikey-get

get config of apikey

#### Parameters

| Name | Description |
| --- | --- |
| --apikey <apikey> | apikey |
| --all | get all apikey |

#### Example

```bash
ezu apikey-get --apikey demo

{
  "name": "user3",
  "access": [
    "enrich",
    "admin"
  ],
  "attributes": "*",
  "allowed": true
}
```

### apikey-load

load the content of JSON file of apikey

#### Parameters

| Name | Description |
| --- | --- |
| --file <file> | filepath of JSON file of apikey  |
| | |

#### Example

```bash
ezu apikey-load --file ./keys.json

info: Your apikey file are loaded successfully
```

## Unpaywall structure
To see all available unpaywall attributes, [click here](https://github.com/ezpaarse-project/ez-unpaywall/tree/master#object-structure).

## Test
Make sure you have [ezunpaywall](https://github.com/ezpaarse-project/ezunpaywall) start in dev mode

```bash
$ npm run test
```
