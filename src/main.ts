// External Dependencies
import * as core from '@actions/core'
import * as fs from 'fs'
import * as gh from '@actions/github'

class ChangedFiles {
  updated: string[] = []
  created: string[] = []
  deleted: string[] = []
  files: string[] = []

  getOutput(files: string[]): string {
    if (core.getInput('plaintext')) {
      return files.join(' ')
    } else {
      return JSON.stringify(files)
    }
  }

  createdOutput(): string {
    return this.getOutput(this.created)
  }

  fileOutput(): string {
    return this.getOutput(this.files)
  }

  updatedOutput(): string {
    return this.getOutput(this.updated)
  }

  deletedOutput(): string {
    return this.getOutput(this.deleted)
  }
}

class File {
  added: string = ''
  modified: string = ''
  removed: string = ''
  filename: string = ''
  status: string = ''
  previous_filename: string = ''
  distinct: boolean = true
}

async function sortChangedFiles(files: any): Promise<ChangedFiles> {
  return files.reduce((acc: ChangedFiles, f: File) => {
    if (f.status === 'added' || f.added) {
      acc.created.push(f.filename === undefined ? f.added : f.filename)
      acc.files.push(f.filename === undefined ? f.added : f.filename)
    }
    if (f.status === 'removed' || f.removed) {
      acc.deleted.push(f.filename === undefined ? f.removed : f.filename)
    }
    if (f.status === 'modified' || f.modified) {
      acc.updated.push(f.filename === undefined ? f.modified : f.filename)
      acc.files.push(f.filename === undefined ? f.modified : f.filename)
    }
    if (f.status === 'renamed') {
      acc.created.push(f.filename)
      acc.deleted.push(f.previous_filename)
    }
    return acc
  }, new ChangedFiles())
}

async function getChangedPRFiles(
  client: gh.GitHub,
  prNumber: number
): Promise<ChangedFiles> {
  const options = client.pulls.listFiles.endpoint.merge({
    owner: gh.context.repo.owner,
    repo: gh.context.repo.repo,
    pull_number: prNumber
  })
  return sortChangedFiles(
    await client.paginate(options).then(files => {
      return files
    })
  )
}

async function getChangedPushFiles(
  client: gh.GitHub,
  base: string,
  head: string
): Promise<ChangedFiles> {
  const response = await client.repos.compareCommits({
    owner: gh.context.repo.owner,
    repo: gh.context.repo.repo,
    base,
    head
  })
  return sortChangedFiles(response.data.files)
}

function getPrNumber(): number | null {
  const pr = gh.context.payload.pull_request
  return pr ? pr.number : null
}

// figure out if it is a PR or Push
async function run(): Promise<void> {
  try {
    const github: any = gh.context
    const token: string = core.getInput('githubToken')
    const client = new gh.GitHub(token)
    let changedFiles = new ChangedFiles()
    if (github.eventName === 'push') {
      // do push actions
      changedFiles = await getChangedPushFiles(
        client,
        github.payload.before,
        github.payload.after
      )
    } else if (github.eventName === 'pull_request') {
      // do PR actions
      const prNumber = getPrNumber()
      if (prNumber != null) {
        changedFiles = await getChangedPRFiles(client, prNumber)
      } else {
        core.setFailed(
          'Could not get pull request number from context, exiting'
        )
        return
      }
    } else {
      core.setFailed(
        `Change not initiated by a PR or Push, it was ${
          github.eventName
        } instead.  Github:${JSON.stringify(github)}`
      )
      return
    }

    //write files to preserve original functionality
    fs.writeFileSync(
      `${process.env.HOME}/files.json`,
      changedFiles.fileOutput(),
      'utf-8'
    )
    fs.writeFileSync(
      `${process.env.HOME}/files_modified.json`,
      changedFiles.updatedOutput(),
      'utf-8'
    )
    fs.writeFileSync(
      `${process.env.HOME}/files_added.json`,
      changedFiles.createdOutput(),
      'utf-8'
    )
    fs.writeFileSync(
      `${process.env.HOME}/files_deleted.json`,
      changedFiles.deletedOutput(),
      'utf-8'
    )
    //also export some outputs
    core.setOutput('files', changedFiles.fileOutput())
    core.setOutput('files_added', changedFiles.createdOutput())
    core.setOutput('files_modified', changedFiles.updatedOutput())
    core.setOutput('files_deleted', changedFiles.deletedOutput())
    process.exit(0)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
