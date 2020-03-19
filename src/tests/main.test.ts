import {Env, p, getTestEvents, getTestFiles} from './mocks/env'

let env: Env = new Env({}, {})

describe('Testing main.ts...', () => {
  describe.each(p.testEvents)('...with %s event...', event => {
    /**
     * @function run
     */
    describe('...with function run...', () => {
      describe.each(getTestEvents(p.getFormatExtInputs, 'push'))('...with fileOutput %s...', (fileOutputName, fileOutputInput, outputExpected) => {
        describe.each(getTestEvents(p.changedFilesInput(event),event))('...with output %o...', (outputInput, outputFiles, expectedOutput) => {
          afterEach(() => {
            process.env = {...env.envStart}
            jest.resetAllMocks()
            jest.resetModules()
            env = new Env({}, {
              githubRepo: 'file-changes-action',
              githubToken: 'TestToken',
              output: outputInput.format,
              fileOutput: fileOutputInput,
            })
          })
          it('...normal', async () => {
            const githubHelper = require('../GithubHelper')
            const filesHelper = require('../FilesHelper')
            githubHelper.getChangedFiles = jest.fn(() => getTestFiles(outputFiles).files)
            filesHelper.writeOutput = jest.fn(() => {})
            filesHelper.writeFiles = jest.fn(() => {})
            const processExitMock = jest.spyOn(process, 'exit').mockImplementation((code?:number | undefined) => code as never)
            const {run} = require('../main')
            await run
            expect(githubHelper.getChangedFiles).toBeCalled()
            expect(filesHelper.writeOutput).toBeCalled()
            expect(filesHelper.writeFiles).toBeCalled()
            expect(processExitMock).toBeCalled()
          })
          it.each(getTestEvents(p.mainErrorInputs, 'push'))('...throws error for function %s...', async (f, e, expected) => {
            const inputHelper = require('../InputHelper')
            const {setFailed} = require('@actions/core')
            inputHelper.getInputs = jest.fn(() => {throw new Error(e)})
            const {run} = require('../main')
            await expect(run).toBe(run)
            expect(setFailed).toBeCalledWith(`${expected}\nException: ${e}`)
            expect(inputHelper.getInputs).toHaveBeenCalledTimes(1)
          })
        })
      })
    })
  })
})