// External Dependencies
import * as core from '@actions/core'
import * as fs from 'fs'
import * as gh from '@actions/github'

class ChangedFiles {
  updated: string[] = []
  created: string[] = []
  deleted: string[] = []
  files: string[] = []
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
  const response = await client.pulls.listFiles({
    owner: gh.context.repo.owner,
    repo: gh.context.repo.repo,
    pull_number: prNumber
  })
  return sortChangedFiles(response.data)
}

async function getChangedPushFiles(commits: File[]): Promise<ChangedFiles> {
  const distinctCommits = commits.filter(c => c.distinct)
  return sortChangedFiles(distinctCommits)
}

function getPrNumber(): number | null {
  const pr = gh.context.payload.pull_request
  return pr ? pr.number : null
}

// figure out if it is a PR or Push
async function run(): Promise<void> {
  try {
    const github: any = gh
    let changedFiles = new ChangedFiles()
    if (github.event_name === 'push') {
      // do push actions
      changedFiles = await getChangedPushFiles(github.event.commits)
    } else if (github.event_name === 'pullRequest') {
      // do PR actions
      const prNumber = getPrNumber()
      if (prNumber != null) {
        const token: string = core.getInput('githubToken')
        const client = new gh.GitHub(token)
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
          github.event_name
        } instead.  Github:${JSON.stringify(github)}`
      )
      return
    }
    //write files to preserve original functionality
    fs.writeFileSync(
      `${process.env.HOME}/files.json`,
      JSON.stringify(changedFiles.files),
      'utf-8'
    )
    fs.writeFileSync(
      `${process.env.HOME}/files_modified.json`,
      JSON.stringify(changedFiles.updated),
      'utf-8'
    )
    fs.writeFileSync(
      `${process.env.HOME}/files_added.json`,
      JSON.stringify(changedFiles.created),
      'utf-8'
    )
    fs.writeFileSync(
      `${process.env.HOME}/files_deleted.json`,
      JSON.stringify(changedFiles.deleted),
      'utf-8'
    )
    //also export some outputs
    core.setOutput('files_created', changedFiles.created.join(' '))
    core.setOutput('files_updated', changedFiles.updated.join(' '))
    core.setOutput('files_deleted', changedFiles.deleted.join(' '))
    process.exit(0)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
