
# Workflow Information

- [Workflow Information](#workflow-information)
- [Overview](#overview)
  - [Pull Request](#pull-request)
    - [develop](#develop)
    - [master](#master)
  - [Push](#push)
    - [master](#master-1)

# Overview

1. Make a **Pull Request** from your forked branch with changes to _trilom/file-changes-action/develop_ branch.
2. This will trigger an automatic merge into _develop_, create a new _staging-HASH_ branch and a new **Pull Request** will be opened from that branch to _master_.  Developed will then be re-based to _master_.
3. In the new **Pull Request** tests will be ran against the code.  Once satisfied the code will be merged into _master_
4. Once merged into _master_ the workflow will deploy the code to NPM, Github Package Repo, and Github Actions marketplace by pushing to _releases/v1_.


- When any **Push** or **Pull Request** type runs:
  - Build code with `make run` which runs `yarn` and `tsc` (**build**)
  - Test code with `make run COMMAND=test` which runs `jest` (**test**)

## Pull Request

- When a **Pull Request** is `opened` to anything other than _develop_ or _master_ (**close_non_develop_pr**):
  - Close **Pull Request** and inform user to merge to _develop_

### develop

- When a **Pull Request** is `opened` to _develop_(**merge_develop_pr**):
  - Check out the **Pull Request** code
  - Merge the **Pull Request** code to _develop_ branch
    - If error, notify @trilom and **Pull Request** user
  - Get changed files
  - Update AUTHORS file
  - **Push** AUTHORS file
  - Create a new **Pull Request** from branch _staging-HASH_ to base _master_
  - Rebase _develop_ back to _master_
  - Comment on original **Pull Request** to notify the **Pull Request** user

### master

- When a PR is `opened`, `reopened`, or `synchronize`(d) to _master_ from _staging-HASH_ (**lintdog**)
  - If event from trilom-bot
    - Test code with eslint reviewdog
  - If event from anyone else:
    - Test code with eslint reviewdog
    - Pull the head repo (**format_check_push**)
    - Build code with `make run` which runs `yarn` and `tsc`
    - Check format of code with `make run COMMAND=format-check` which runs `prettier --check`
      - If format fails, then run `make run COMMAND=format` which runs `prettier --write`
      - Clean build files with `make clean`
      - Commit the format changes as trilom-bot to **Pull Request** head
  - Pull the head repo (**release_build**)
  - Run a dry run of semantic release
    - If new release, output the results

## Push

### master

- When a **Push** happens to the _master_ branch:
  - Pull the head repo (**release_build**)
  - Run semantic release
    - If new release, output the results
    - Push to NPM
    - Prepare env to push to Github Package Repo
    - Push to Github Package Repo
    - Build for release by running `make run COMMAND=release RELEASE=TRUE` this will build dist, and node_modules so that the package can be pushed to _releases/v1_.
    - **Push** _master_ to _releases/v1_ branch as trilom.
