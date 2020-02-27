# file-changes-action

This action will take the information from the Push/Pull Request and output some variables and write files that will let you know what was changed, removed, or added.

## Use Cases

I have a process where I have AWS Cloudformation templates stored in one directory that might be named PRODUCT-ROLE, and mappings for these templates that span the PRODUCT.  For example **mappings/wordpress.mappings.yml, templates/wordpress-database.yml, templates/wordpress-webserver.yml**, and some of the templates might use different Lambda functions defined in for example **functions/wordpress-webserver/**.

In the example below we have a workflow that on *push* to the develop branch we can perform some actions based on the files.  In my use case I look for changes on the develop branch of this repository for every push that happens.  When a push happens and a change is made to any of the paths below the workflow will trigger.  With this action you are able to know exactly which files changed so that you can make decisions later in your CI/CD.

In this case, if a **templates/*.yml** file is changed, then we want to update the Cloudformation stack.  We can also write specifics for related templates.  For example, if **templates/wordpress-database.yml** changes then we want to deploy **templates/wordpress-webserver.yml** as well after.

Another case is if the **mappings/wordpress.mappings.yml** changes, we want to deploy all **template/wordpress-*.yml** files.

## How to Use

In order to make those decisions we need to know what files have changed and that is where this action comes in.  In the example below we are checking out our repository code, and then running the `trilom/file-changes-action@v1` action.  The only thing you need to provide is a GITHUB_TOKEN so that Octokit can make it's API calls.

If a PR is made then it will look at all of the files included in the PR.
If a push is made then it will compare commits from the SHA `github.context.payload.before` to the SHA `github.context.payload.after` of the push.

After gathering this information it will output the files in 2 ways.  
  
- As an output variable, you can use this variable by using `steps.file_changes.outputs.files_modified`, `steps.file_changes.outputs.files_added`, `steps.file_changes.outputs.files_deleted`.

- As a file on the container stored at `$HOME/files.json`, `$HOME/files_modified.json`, `$HOME/files_added.json`, `$HOME/files_deleted.json`.  Example:

```files_added.json
["cloudformation/mappings/wordpress.mappings.yml","cloudformation/templates/wordpress-database.yml"]
```

## Examples  

```yaml .github/workflows/push_develop.yml
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
      - name: test
        run: |
          ls $HOME
          cat $HOME/files.json
          cat $HOME/files_modified.json
          cat $HOME/files_added.json
          cat $HOME/files_deleted.json
          echo '${{ steps.file_changes.outputs.files_modified}}'
          echo '${{ steps.file_changes.outputs.files_added}}'
          echo '${{ steps.file_changes.outputs.files_deleted}}'
```
