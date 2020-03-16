// External Dependencies
import {error as coreError, setFailed as coreSetFailed} from '@actions/core'
import { writeOutput, writeFiles, sortChangedFiles} from './FilesHelper'
import {getInputs, inferInput} from './InputHelper'
import { getChangedFiles, initClient} from './GithubHelper'


// figure out if it is a PR or Push
export async function run(): Promise<void> {
  try {
    // get inputs
    const inputs = getInputs()
    // parse input
    const inferred = inferInput(inputs.pushBefore, inputs.pushAfter, inputs.prNumber)
    // prepare client
    const client = initClient(inputs.githubToken)
    // get changed files
    const changedFilesArray = await getChangedFiles(client, inputs.githubRepo, inferred)
    // sort changed files
    const changedFiles = sortChangedFiles(changedFilesArray)
    Object.keys(changedFiles).forEach(key => {
      // write file output
      writeFiles(inputs.fileOutput, key, changedFiles[key])
      // write output vars
      writeOutput(inputs.output, key, changedFiles[key])
    })
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0)
  } catch (error) {
    const pError = JSON.parse(error.message)
    const prettyError = JSON.stringify(error.message, null, 2)
    // catch error from getInputs
    if (pError.from.includes(getInputs.name))
      coreError(`There was an getting action inputs.\nException: ${prettyError}`)
    // catch error from inferInput
    if (pError.from.includes(inferInput.name))
      coreError(`There was an issue inferring inputs to the action.\nException: ${prettyError}`)
    // catch error from initClient
    else if (pError.from.includes(initClient.name))
      coreError(`There was an issue initilizing the github client.\nException: ${prettyError}`)
    // catch error from getChangedFiles
    else if (pError.from.includes(getChangedFiles.name))
      coreError(`There was an issue getting changed files from Github.\nException: ${prettyError}`)
    // catch error from sortChangedFiles
    else if (pError.from.includes(sortChangedFiles.name))
      coreError(`There was an issue sorting changed files from Github.\nException: ${prettyError}`)
    // catch error from writeFiles
    else if (pError.from.includes(writeFiles.name))
      coreError(`There was an issue writing output files.\nException: ${prettyError}`)
    // catch error from writeOutput
    else if (pError.from.includes(writeOutput.name))
      coreError(`There was an issue writing output variables.\nException: ${prettyError}`)
    else coreError(JSON.stringify(pError))
    coreSetFailed(error.message)
  }
}

run()
