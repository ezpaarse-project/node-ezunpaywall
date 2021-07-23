# node-ezunpaywall
> Tools for [ezunpaywall](https://github.com/ezpaarse-project/ez-unpaywall)
**Table of content**
- [Prerequisites](#prerequisites)
- [Installation](#Installation)
- [Development](#Development)
- [Commands](#Commands)
  - [config](#config)
  - [ping](#ping)
  - [update](#update)
  - [enrich](#enrich)
- [Test](#Test)
## Prerequisites

The tools you need to let node-ezunpaywall run are :
* git >= 2.27.0
* npm >= 6.14.8
* NodeJS >= 14.15.0
## Installation

```bash
$ git clone https://github.com/ezpaarse-project/node-ezunoaywall.git
$ cd node-ezunoaywall
$ npm i -g .
```
## Development

```bash
$ git clone https://github.com/ezpaarse-project/node-ezunpaywall.git
$ cd node-ezunpaywall
$ npm install
```
## Commands

You can get help for any command by typing `ezu <command> --help`.

The module provides an `ezunpaywall` command (aliased `ezu`).

| Name | Description |
| --- | --- |
| config | Manage config |
| ping | ping ezunpaywall services |
| update | Load content of unpaywall snapshot in elastic | 
| enrich | enrich file with ezunpaywall | 
### config
Manage config to fetch ezunpyawall.
#### Parameters
| Name | Description |
| --- | --- |
| --get | Get the configuration |
| --set | Set a value to a config key in $HOME/.config |
| -L --list | List of attributes required for configuration |
#### Examples
---
```bash
$ ezunpaywall config -L
```
```
ezunpaywall.protocol
ezunpaywall.host
ezunpaywall.port
ezunpaywall.apikey
ezmeta.protocol
ezmeta.host
ezmeta.port
ezmeta.user
ezmeta.password
```
---
```bash
$ ezunpaywall config --set ezunpaywall.host localhost.test.fr
```
---
```bash
{
  "ezunpaywall": {
    "protocol": "https",
    "host": "localhost.test.fr",
    "port": "443"
    "apikey": "admin"
  },
  "ezmeta": {
    "protocol": "http",
    "host": "localhost",
    "port": "9200",
    "user": "elastic",
    "password": "changeme"
  },
}
info: from /home/user/.config/.ezunpaywallrc
```
### ping
Check if services are available.
#### Parameters
| Name | Description |
| --- | --- |
| -u --use | Use a custom config |
#### Example
```bash
$ ezunpaywall ping
```
```bash
info: Ping graphql service: OK
info: Ping update service: OK
info: Ping enrich service: OK
info: ezmeta: OK
```
### update

Command

| Name | Description |
| --- | --- |
| job | Start a update process |
| status | Get status of process |
| report | Get report |
| | |
#### job
updates ezunpaywall data
##### Parameters

| Name | Description |
| --- | --- |
| --file | Snapshot's file installed on ezunpaywall |
| --startDate | Start date to download and insert updates from unpaywall |
| --endDate | End date to download and insert updates from unpaywall |
| --offset | Line where processing will start |
| --limit | Line where processing will end |
| --force | Force reload |
| -L --list | Get list of snapshot installed on ezunpaywall |
| -I --index  | Name of the index to which the data is inserted |
| -U --use | Use a custom config |
| | |
##### Examples
---
```bash
$ ezunpaywall update job
```
```bash
$ info: Weekly update started
```
---
```bash
$ ezunpaywall update job -L
```
```bash
$ ? files (Use arrow keys)
  ❯ file1.jsonl.gz 
    file2.jsonl.gz 
    file3.jsonl.gz 
```
```bash
$ info: Update with file1.jsonl.gz
```
---

```bash
$ ezunpaywall update job --file file1.jsonl.gz
```

```bash
$ info: Update with file1.jsonl.gz
```
---
```bash
$ ezunpaywall update job --file file1.jsonl.gz --offset 10 --limit 20
```

```bash
$ info: Update with file1.jsonl.gz
```
---
```bash
$ ezunpaywall update job --startDate 2020-04-27
```

```bash
$ info: Dowload and insert snapshot from unpaywall from 2020-04-27 and ${date}
```
---

```bash
$ ezunpaywall update job --startDate 2020-04-27
```

```bash
$ info: Dowload and insert snapshot from unpaywall from 2020-04-27 and 2020-04-30
```
---

#### status
get the status of the running process

##### Parameters
| Name | Description |
| --- | --- |
| -U --use | Use a custom config |
##### Example
---
```bash
$ ezu update status
```

```bash
$ info: An update is being done
{
  "state": {
    "done": false,
    "createdAt": "2021-07-23T08:13:38.334Z",
    "endAt": null,
    "steps": [
      {
        "task": "askUnpaywall",
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
$ info: No update is in progress
$ info: Use ezu report --latest to see the latest report
```
---
#### report
get report of ezunpaywal data update.
##### Parameters

| Name | Description |
| --- | --- |
| --file | Name of report |
| --latest | Get the latest report |
| -L --list | List of reports |
| -U --use | Use a custom config |
##### Examples
---
```bash
$ ezu update report -L
```
```bash
? reports (Use arrow keys)
❯ report1.json
  report2.json
  report3.json
```
```bash
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
```bash
$ ezu update report --latest
```
```bash
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
### enrich
Enriched a file with attributes unpaywall.
By default, if no attributes is informed, it will enriched with all attributes.

Command

| Name | Description |
| --- | --- |
| job | Start a update process |
| status (comming soon) | Get status of process |
| | |

#### job
##### Parameters
| Name | Description |
| --- | --- |
| --file | File which must be enriched |
| --attributes | Attributes which must be enriched in graphql format. By default, all attributes are added |
| --separator | Separator of out csv file |
| --out | Name of enriched file. By default, it's named: out.jsonl |
| -I --index  | name of the index from which the data will be retrieved |
| -U --use | use a custom config |
##### Examples

---
```bash
$ ezu enrich job --file mustBeEnrich.csv --separator ";"
```
---
```bash
$ ezu enrich job --file mustBeEnrich.jsonl --separator ";" --attributes "{ is_oa, best_oa_location { license }, z_authors{ family } }"
```
---


## Unpaywall structure
To see all available unpaywall attributes, [click here](https://github.com/ezpaarse-project/ez-unpaywall/tree/master#object-structure).

## Test
Make sure you have [ezunpaywall](https://github.com/ezpaarse-project/ezunpaywall) start in dev mode

```bash
$ npm run test
```