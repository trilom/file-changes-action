// External Dependencies
import * as core from '@actions/core'
import * as fs from 'fs'
import * as gh from '@actions/github'
import {ChangedFiles, sortChangedFiles} from './ChangedFiles'

async function getChangedPRFiles(
  repo: string,
  client: gh.GitHub,
  prNumber: number
): Promise<ChangedFiles> {
  const options = client.pulls.listFiles.endpoint.merge({
    owner: repo.split('/')[0],
    repo: repo.split('/')[1],
    pull_number: prNumber
  })
  return sortChangedFiles(
    await client.paginate(options).then(files => {
      return files
    })
  )
}

async function getChangedPushFiles(
  repo: string,
  client: gh.GitHub,
  base: string,
  head: string
): Promise<ChangedFiles> {
  const response = await client.repos.compareCommits({
    owner: repo.split('/')[0],
    repo: repo.split('/')[1],
    base,
    head
  })
  return sortChangedFiles(response.data.files)
}

function writeFiles(format: string, changedFiles: ChangedFiles): void {
  switch (format.trim()) {
    case 'json':
      format = '.json'
      break
    case ',':
      format = '.csv'
      break
    default:
      format = '.txt'
      break
  }
  //write files to preserve original functionality
  fs.writeFileSync(
    `${process.env.HOME}/files${format}`,
    changedFiles.fileOutput(format),
    'utf-8'
  )
  fs.writeFileSync(
    `${process.env.HOME}/files_modified${format}`,
    changedFiles.updatedOutput(format),
    'utf-8'
  )
  fs.writeFileSync(
    `${process.env.HOME}/files_added${format}`,
    changedFiles.createdOutput(format),
    'utf-8'
  )
  fs.writeFileSync(
    `${process.env.HOME}/files_deleted${format}`,
    changedFiles.deletedOutput(format),
    'utf-8'
  )
}

function writeOutput(format: string, changedFiles: ChangedFiles): void {
  //also export some outputs
  core.setOutput('files', changedFiles.fileOutput(format))
  core.setOutput('files_added', changedFiles.createdOutput(format))
  core.setOutput('files_modified', changedFiles.updatedOutput(format))
  core.setOutput('files_deleted', changedFiles.deletedOutput(format))
}

// figure out if it is a PR or Push
async function run(): Promise<void> {
  try {
    const github: any = gh.context
    const repo: string = core.getInput('githubRepo')
    const token: string = core.getInput('githubToken')
    const output: string = core.getInput('output')
    const fileOutput: string = core.getInput('fileOutput')
    const pushBefore: string = core.getInput('pushBefore')
    const pushAfter: string = core.getInput('pushAfter')
    const prNumber: string = core.getInput('prNumber')
    const isPush = pushBefore !== '' && pushAfter !== ''
    const isPR = prNumber !== ''
    const client = new gh.GitHub(token)
    let changedFiles = new ChangedFiles()
    if (isPush && isPR) {
      core.setFailed(
        `You can't pick PR and Push, I don't know which one to do.`
      )
    } else if (isPR) {
      // do PR actions
      if (prNumber != null) {
        changedFiles = await getChangedPRFiles(repo, client, parseInt(prNumber))
      } else {
        core.setFailed(
          'Could not get pull request number from context, exiting'
        )
        return
      }
    } else if (isPush) {
      // do push actions
      changedFiles = await getChangedPushFiles(
        repo,
        client,
        pushBefore,
        pushAfter
      )
    } else {
      core.setFailed(
        `Change not initiated by a PR or Push, it was ${
          github.eventName
        } instead.  Github:${JSON.stringify(github)}`
      )
      return
    }
    // write file output
    writeFiles(fileOutput, changedFiles)

    // write output vars
    writeOutput(output, changedFiles)

    process.exit(0)
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
