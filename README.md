# file-changes-action

This action will take the information from the Push/Pull Request and output some variables and write files that will let you know what was changed, removed, or added.

## Inputs

### githubToken

**Required**  - `string` - your github token

### output

_Optional_  - `string` - type of output for output variables, default is json.  Use ',' for comma separated values, or ' ' for space delimited values.  You can also create your own delimiter for example ' |FILE:' will output 'file1.yml |FILE:file2.yml |FILE:file3.yml'.

### fileOutput

_Optional_  - `string` - type of output for file output, default is json.  Use ',' for comma separated values, or ' ' for space delimited values.  You can also create your own delimiter for example `\ |FILE:` will output:

> file1.yml |FILE:file2.yml |FILE:file3.yml  

If you select json then the file format will be .json, if you select ',' then the file format will be .csv, anything else will output the files as .txt

## Outputs

### files

**Required** - `string` - The names all new, updated, and deleted files.  The output is dependant on the output input, default is a json string.

### files_added

**Required** - `string` - The names of the newly created files.  The output is dependant on the output input, default is a json string.

### files_modified

**Required** - `string` - The names of the updated files.  The output is dependant on the output input, default is a json string.

### files_deleted

**Required** - `string` - The names of the deleted files.  The output is dependant on the output input, default is a json string.

## Example usage

```yaml
id: file_changes
uses: trilom/file-changes-action@v1
with:
  githubToken: ${{ secrets.GITHUB_TOKEN }}
```

## How to Use

In order to make those decisions we need to know what files have changed and that is where this action comes in.  In the example below we are checking out our repository code, and then running the `trilom/file-changes-action@v1` action.  The only thing you need to provide is a GITHUB_TOKEN so that Octokit can make it's API calls.

If a PR is made then it will look at all of the files included in the PR.
If a push is made then it will compare commits from the SHA `github.context.payload.before` to the SHA `github.context.payload.after` of the push.

After gathering this information it will output the files in 2 ways.  
  
- As an output variable, you can use this variable by using `steps.file_changes_outputs_files`, `steps.file_changes.outputs.files_modified`, `steps.file_changes.outputs.files_added`, `steps.file_changes.outputs.files_deleted`.

- As a file on the container stored at `$HOME/files.json`, `$HOME/files_modified.json`, `$HOME/files_added.json`, `$HOME/files_deleted.json`.  

- _NOTE:_ If you set a custom delimiter in output or fileOutput inputs then you will receive different files.  For example a delimiter of ',' will output at `$HOME/files.csv` instead of `$HOME/files.json`.  Likewise, anything other than 'json' or ',' delmiters will output `$HOME/files.txt` files instead of `$HOME/files.json` by default.

## Use Cases

I have a process where I have AWS Cloudformation templates stored in one directory that might be named PRODUCT-ROLE, and mappings for these templates that span the PRODUCT.  For example **mappings/wordpress.mappings.yml, templates/wordpress-database.yml, templates/wordpress-webserver.yml**, and some of the templates might use different Lambda functions defined in for example **functions/wordpress-webserver/**.

In the example below we have a workflow that on *push* to the develop branch we can perform some actions based on the files.  In my use case I look for changes on the develop branch of this repository for every push that happens.  When a push happens and a change is made to any of the paths below the workflow will trigger.  With this action you are able to know exactly which files changed so that you can make decisions later in your CI/CD.

In this case, if a **templates/*.yml** file is changed, then we want to update the Cloudformation stack.  We can also write specifics for related templates.  For example, if **templates/wordpress-database.yml** changes then we want to deploy **templates/wordpress-webserver.yml** as well after.

Another case is if the **mappings/wordpress.mappings.yml** changes, we want to deploy all **template/wordpress-*.yml** files.

## More examples  

```yaml
name: push-develop

on:
  push:
    branches:
      - develop
  
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - id: file_changes
        uses: trilom/file-changes-action@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
      - name: test
        run: |
          ls $HOME
          cat $HOME/files.json
          cat $HOME/files_modified.json
          cat $HOME/files_added.json
          cat $HOME/files_deleted.json
          echo '${{ steps.file_changes.outputs.files}}'
          echo '${{ steps.file_changes.outputs.files_modified}}'
          echo '${{ steps.file_changes.outputs.files_added}}'
          echo '${{ steps.file_changes.outputs.files_deleted}}'
```

You can set the output and fileOutput to ',' for csv output.

```yaml
name: push-develop

on:
  push:
    branches:
      - develop
    paths:
      - 'cloudformation/templates/*.yml'
      - 'cloudformation/mappings/*.yml'
      - 'functions/*'
  
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - id: file_changes
        uses: trilom/file-changes-action@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          output: ','
          fileOutput: ','
      - name: test
        run: |
          cat $HOME/files.csv
```

You can set the output and fileOutput to ' ' for txt output.

```yaml
name: push-develop

on:
  push:
    branches:
      - develop
    paths:
      - 'cloudformation/templates/*.yml'
      - 'cloudformation/mappings/*.yml'
      - 'functions/*'
  
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - id: file_changes
        uses: trilom/file-changes-action@v1
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          output: ' '
          fileOutput: ' '
      - name: test
        run: |
          cat $HOME/files.txt
```
 
```bash
# install project dependencies (including devDependencies)
yarn
# build the project (dist files)
yarn build
# build and lint

# run prettier (this will make your ugly code pretty)
yarn format
# dry-run prettier (this will tell you if your ugly code needs to be made pretty)
yarn format-check
# lint project
yarn lint
# test
yarn jest

# clean duh
yarn clean
```