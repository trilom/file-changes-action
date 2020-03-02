
# Workflow Information

- [Workflow Information](#workflow-information)
- [Overview](#overview)
  - [Schedule](#schedule)
  - [Issue Comment](#issue-comment)
        - [**NOT WORKING ATM**](#not-working-atm)
  - [Pull Request](#pull-request)
  - [Push](#push)

# Overview

1. Make a **Pull Request** from your forked branch (forked from _master_) with changes to _trilom/file-changes-action/master_ branch.
2. Once merged into master this will lint the code and provide output in the checks, update the AUTHORS file, and package _dist/_.  If there is a release then this will create a **Pull Request** from the _1|2.\*.\*_ branch to _master_ and a comment will be made on the original **Pull Request** notifying contributors.  If there is not a release the changes will be **push**ed to _master_.
3. In the **Pull Request** linting and testing will be performed again.  [semantic-release](https://github.com/semantic-release/semantic-release) will run to create the Github Release, release notes, changelog, notify Slack, package and deploy to NPM and Github Package Repo, label the release, and notify any issues of it's deployment.
4. If _linted_, _tested_, _builds_, _released_ and _lintdogged_ label exist and _hold merge_ does not the release will be merged into _master_.

## Schedule

- Everyday at 5:00 AM GMT:
  - Run integration tests.

## Issue Comment

##### **NOT WORKING ATM**

- When any `created` **Issue Comment** type runs on a **Pull Request** from trilom with the body of `/release`(**automerge.yml**):
  - If _linted_, _tested_, _builds_, _lintdogged_, and _hold merge_ or _automated merge_ **does not** labels exist:
    - Merge the **Pull Request** and add the _automated merge_ label
      - If failure, put some output on the original PR.

## Pull Request

- When any `opened`, `reopened`, or `synchronize` **Pull Request** type runs to the _master_ branch from a _1|2.\*.\*_ branch:
  - Run integration tests.

- When any `opened` or `reopened` **Pull Request** type runs on any branch other than _master_ from anyone other than trilom or trilom-bot from a forked branch(**close_pr.yml**):
  - Close the **Pull Request** and put the dunce cap on.

- When any `labeled`, or `closed` **Pull Request** type runs on _master_, _next_, _alpha_, or _beta_(**automerge.yml**):
  - If _linted_, _tested_, _builds_, _lintdogged_ exists and _hold merge_, _automated merge_, and _released_ **does not** labels exist:
    - Merge the **Pull Request** and add the _automated merge_ label.  Add a commit message of `Auto merge from...`
      - If failure, put some output on the original PR.
  - If _linted_, _tested_, _builds_, _lintdogged_, _released_ exists and _hold merge_ or _automated merge_ **does not** labels exist:
    - Merge the **Pull Request** and add the _automated merge_ label.  Add a commit message of `Release merge from...`
      - If failure, put some output on the original PR.

- When any `opened`, `reopened`, or `synchronize` **Pull Request** type runs(**pr.yml**):
  - Assign it to trilom (**add-reviews**)
  - Build code with `make run` which runs `yarn` and `tsc` (**build**)
    - Label with builds if passing and on inner workspace
  - Test code with `make run COMMAND=test` which runs `jest` (**test**)
    - Label with tested if passing and on inner workspace
  - Test code with eslint reviewdog and report back if inner workspace (**lintdog**)
    - Label with pretty if passing and on inner workspace
  - Check format of code with `make run COMMAND=format-check` which runs `prettier --check` (**format_check_push**)
    - If:
      - Fork then pull **Pull Request** github.ref with GITHUB_TOKEN
      - Inner **Pull Request** then pull HEAD repo ref
    - Build code with `make run` which runs `yarn` and `tsc`
      - If format-check succeeds and on inner workspace
        - Label with pretty
      - If format-check fails and on inner workspace and actor is not trilom-bot
        - Run `make run COMMAND=format` which runs `prettier --write`
        - Clean build files with `make clean`
        - Commit the format changes as trilom-bot to **Pull Request** head
  - Run [semantic-release](https://github.com/semantic-release/semantic-release)
    - Checkout BASE with a fetch-depth of 0
    - Run semantic-release action to prepare Github Release, release notes, changelog, notify Slack, package and deploy to NPM
      - If release then setup Action for push to Github Package Registry and publish
      - Tag the **Pull Request** as _released_ if successful, if not notify the **Pull Request** of any issues

## Push

- When any **Push** type runs to _master_, _next_, _alpha_, or _beta_(**push.yml**):
  - Build code with `make run` which runs `yarn` and `tsc` (**build**)
  - Test code with `make run COMMAND=test` which runs `jest` (**test**)
  - Test code with eslint reviewdog and report back with github checks(**lintdog**)
- When any **Push** type runs to _master_, _next_, _alpha_, or _beta_ from anyone with a head_commit message **NOT** starting with 'chore(release):', 'Auto merge from 1.', or 'Auto merge from 2.':
  - Build **dist/\*\*.js** files, update **AUTHORS**, format **src/\*\*.ts** files and commit.
  - Test [semantic-release](https://github.com/semantic-release/semantic-release) if a release is ready then create a **Pull Request**
    - Echo release outputs
    - Get changed files with [file-changes-action](https://github.com/trilom/file-changes-action) and build a message to post to new **Pull Request**
    - Comment on the original **Pull Request** with the new details of the release.
  - If no release, then **Push** changes directly back to master.
