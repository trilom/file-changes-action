
# Workflow Information

- [Workflow Information](#workflow-information)
- [Overview](#overview)
  - [Pull Request](#pull-request)
    - [master](#master)
    - [any branch not master](#any-branch-not-master)
  - [Push](#push)
    - [master](#master-1)

# Overview

1. Make a **Pull Request** from your forked branch (forked from _master_) with changes to _trilom/file-changes-action/master_ branch.
2. Once merged into _master_ this will create a new _master-HASH_ branch and a new **Pull Request** will be opened from that branch to _master_.
3. In the new **Pull Request** tests will be ran against the code, and linting changes will be pushed.  If all is good it will be automatically merged to _master_, if not then a comment will be made on the PR to discuss.
4. Once merged into _master_ the workflow will deploy the code to NPM, Github Package Repo, and Github Actions marketplace by pushing to _releases/v1_.

## Pull Request

- When any `opened`, `reopened`, or `synchronize` **Pull Request** type runs:
  - Build code with `make run` which runs `yarn` and `tsc` (**build**)
    - Label with builds if passing and on inner workspace
    - Label with doesnt build if failed and on inner workspace
  - Test code with `make run COMMAND=test` which runs `jest` (**test**)
    - Label with tested if passing and on inner workspace
    - Label with untested if failed and on inner workspace
  - Lint code with `make run COMMAND=lint` which runs `eslint` (**lintdog**)
  - Check format of code with `make run COMMAND=format-check` which runs `prettier --check` (**format_check_push**)
    - Test code with eslint reviewdog and report back if inner workspace
    - Pull the head repo
    - Build code with `make run` which runs `yarn` and `tsc`
      - If format-check succeeds and on inner workspace
        - Label with pretty
        - Auto merge PR to master if all tags are there (pretty,builds,tested)
          - Comment on PR with info if failure
      - If format-check fails and on inner workspace and actor is not trilom-bot
        - Run `make run COMMAND=format` which runs `prettier --write`
        - Clean build files with `make clean`
        - Commit the format changes as trilom-bot to **Pull Request** head
          - Label with ugly if failed

### master

- When a PR is `opened`, `reopened`, or `synchronize`(d) to _master_ from _master-HASH_ (**automerge_pr**)
  - ( after **format_check_push** )
  - Auto merge PR to master if all tags are there (pretty,builds,tested)
    - Comment on PR with info if failure
  - Pull the head repo (**release_build**)
  - Run a dry run of semantic release
    - If new release, output the results

### any branch not master

- When a **Pull Request** is `opened` to anything other than _master_ (**close_non_develop_pr**):
  - Close **Pull Request** and inform user to open **Pull Request** to _master_

## Push

### master

- When a **Push** happens to the _master_ branch not from trilom-bot:
  - Get changed files
  - Update AUTHORS file
  - **Push** AUTHORS file
  - Create a new **Pull Request** from branch _master-HASH_ to base _master_
  - Comment on original **Pull Request** to notify the **Pull Request** user
- When a **Push** happens to the _master_ branch from trilom-bot:
  - Pull the head repo (**release_build**)
  - Run semantic release
    - If new release, output the results
    - Push to NPM
    - Prepare env to push to Github Package Repo
    - Push to Github Package Repo
    - Build for release by running `make run COMMAND=release RELEASE=TRUE` this will build dist, and node_modules so that the package can be pushed to _releases/v1_.
    - **Push** _master_ to _releases/v1_ branch as trilom.
    - Label PR as released.
