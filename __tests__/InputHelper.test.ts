import * as core from '@actions/core'
import { Context } from '@actions/github/lib/context'
import { resolve } from 'path'
import { getInputs, inferInput, IInputs, IInferred } from '../src/InputHelper'
const testEvents = [
  'issue_comment_created',
  'issue_comment_edited',
  'pull_request_opened',
  'pull_request_reopened',
  'pull_request_synchronize',
  'push_merge',
  'push',
  'schedule'
]
const pushAfterInputs = ['1234abcd', '']
const pushBeforeInputs = ['abcd1234', '']
const prNumberInputs = ['1']
const testOutputInputs = ['json']
const testFileOutputInputs = ['json']
// const githubTokenInputs = ['1234abcd', 'dcba4321']
// const pushAfterInputs = ['1234abcd', 'dcba4321']
// const pushBeforeInputs = ['abcd1234', '4321dcba']
// const prNumberInputs = [1, 2]
// const testOutputInputs = ['json', ',', ' ', '_<br />&nbsp;&nbsp;_']
// const testFileOutputInputs = ['json', ',', ' ', '_<br />&nbsp;&nbsp;_']
describe('InputHelper getInputs', () => {
  let inputs: any = {}
  let iinputs: IInputs
  let context: Context
  let inputSpy: jest.SpyInstance
  let logSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance
  
  beforeAll(() => {
    process.env.HOME = resolve(__dirname, 'workspace')
    process.env.GITHUB_WORKSPACE = resolve(__dirname, 'workspace/github')
    process.env.GITHUB_EVENT_PATH = resolve(__dirname, 'payloads/events/push.json')
    process.env.GITHUB_REPOSITORY = "trilom-test/file-changes-action"
    process.env.GITHUB_ACTION = 'file-changes-action'    
  })

  beforeEach(() => {
    // reset github token
    process.env.GITHUB_TOKEN = 'abcd1234'
    // @actions/core
    inputs = {
      "GITHUB_TOKEN": "1234abcd"
    };
    context = new Context()
    // spies
    inputSpy = jest.spyOn(core, 'getInput');
    inputSpy.mockImplementation(name => inputs[name]);
    errorSpy = jest.spyOn(core, 'error').mockImplementation(jest.fn())
    // logs
    logSpy = jest.spyOn(console, 'log');
    logSpy.mockImplementation(line => {
      // uncomment to debug
      process.stderr.write('log:' + line + '\n');
    });

  })
  afterAll(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  })
  testEvents.forEach(event => {
// sets correct default inputs
    it(`${event} - sets correct default inputs`, () => {
      // context
      process.env.GITHUB_EVENT_PATH = resolve(__dirname, `payloads/events/${event}.json`)
      context = new Context()
      // run test function
      iinputs = getInputs(context)
      
      // evaluate outputs
      if (event.includes('push')) {
        expect(iinputs.prNumber).toBe(NaN)
        expect(iinputs.pushAfter).toBe(context.payload.after)
        expect(iinputs.pushBefore).toBe(context.payload.before)
      }
      if (event.includes('pull_request') || event.includes('issue_comment')) {
        expect(iinputs.prNumber).toBe(context.issue.number)
        if (event === 'pull_request_synchronize') {
          expect(iinputs.pushAfter).toBe(context.payload.after)
          expect(iinputs.pushBefore).toBe(context.payload.before)
        } else {
          expect(iinputs.pushAfter).toBeFalsy()
          expect(iinputs.pushBefore).toBeFalsy()
        }
      }
      expect(iinputs.githubToken).toBe(process.env['GITHUB_TOKEN'])
      expect(iinputs.githubRepo).toBe(process.env['GITHUB_REPOSITORY'])
      expect(iinputs.output).toBe('json')
      expect(iinputs.fileOutput).toBe('json')
      expect(core.error).not.toHaveBeenCalled()
    })
// throws error with no token
    it(`${event} - throws error with no token`, () => {
      // context
      process.env.GITHUB_EVENT_PATH = resolve(__dirname, `payloads/events/${event}.json`)
      // empty  process.env token
      process.env.GITHUB_TOKEN = ''
      context = new Context()
      // no token input
      inputs = {};
      inputSpy.mockImplementation(name => inputs[name]);
      // run test function
      expect(() => {
        iinputs = getInputs(context)
      }).toThrowError('Received no token, a token is a requirement.')
      // expect(core.error).toHaveBeenCalled()
    })
    testOutputInputs.forEach(output => {
      testFileOutputInputs.forEach(fileOutput => {
        pushAfterInputs.forEach(pushAfter => {
          pushBeforeInputs.forEach(pushBefore => {
// sets correct pushBefore and pushAfter inputs
            it(`${event} - sets correct pushBefore and pushAfter inputs ["pushBefore": "${pushBefore}", "pushAfter": "${pushAfter}", "output": "${output}", "fileOutput": "${fileOutput}"]`, () => {
              // context
              process.env.GITHUB_EVENT_PATH = resolve(__dirname, `payloads/events/${event}.json`)
              context = new Context()
              // set event and inputs
              inputs['output'] = output
              inputs['fileOutput'] = fileOutput
              inputs['pushAfter'] = pushAfter
              inputs['pushBefore'] = pushBefore
              inputSpy.mockImplementation(name => inputs[name]);
              
              // run test function
              iinputs = getInputs(context)
              
              // evaluate outputs
              if (event.includes('pull_request') || event.includes('issue_comment')) {
                expect(iinputs.prNumber).toBeTruthy()
              }
              if (!pushAfter) expect(iinputs.pushAfter).toBe(context.payload.after)
              else expect(iinputs.pushAfter).toBe(pushAfter)
              if (!pushBefore) expect(iinputs.pushBefore).toBe(context.payload.before)
              else expect(iinputs.pushBefore).toBe(pushBefore)
              expect(iinputs.githubToken).toBe(process.env['GITHUB_TOKEN'])
              expect(iinputs.githubRepo).toBe(process.env['GITHUB_REPOSITORY'])
              expect(iinputs.output).toBe(output)
              expect(iinputs.fileOutput).toBe(fileOutput)
              expect(core.error).not.toHaveBeenCalled()
            })
          })
        })
      })
    })
    testOutputInputs.forEach(output => {
      testFileOutputInputs.forEach(fileOutput => {
        prNumberInputs.forEach(prNumber => {
// sets correct prNumber inputs
          it(`${event} - sets correct prNumber inputs ["prNumber": "${prNumber}", "output": "${output}", "fileOutput": "${fileOutput}"]`, () => {
            // context
            process.env.GITHUB_EVENT_PATH = resolve(__dirname, `payloads/events/${event}.json`)
            context = new Context()
            // set event and inputs
            inputs['output'] = output
            inputs['fileOutput'] = fileOutput
            inputs['prNumber'] = prNumber
            inputSpy.mockImplementation(name => inputs[name]);

            // run test function
            iinputs = getInputs(context)

            // evaluate outputs
            if (event.includes('push')) {
              expect(iinputs.pushAfter).toBe(context.payload.after)
              expect(iinputs.pushBefore).toBe(context.payload.before)
            }
            if (event.includes('pull_request') || event.includes('issue_comment')) {
              if (event === 'pull_request_synchronize') {
                expect(iinputs.pushAfter).toBe(context.payload.after)
                expect(iinputs.pushBefore).toBe(context.payload.before)
              } else {
                expect(iinputs.pushAfter).toBeFalsy()
                expect(iinputs.pushBefore).toBeFalsy()
              }
            }
            expect(iinputs.prNumber).toBe(+prNumber)
            expect(iinputs.githubToken).toBe(process.env['GITHUB_TOKEN'])
            expect(iinputs.githubRepo).toBe(process.env['GITHUB_REPOSITORY'])
            expect(iinputs.output).toBe(output)
            expect(iinputs.fileOutput).toBe(fileOutput)
            expect(core.error).not.toHaveBeenCalled()
          })
        })
      })
    })
    testOutputInputs.forEach(output => {
      testFileOutputInputs.forEach(fileOutput => {
        pushBeforeInputs.forEach(pushBefore => {
// sets correct pushBefore and prNumber
          it(`${event} - sets correct pushBefore and prNumber inputs ["prNumber": "1", "pushBefore": "${pushBefore}", "output": "${output}", "fileOutput": "${fileOutput}"]`, () => {
            // context
            process.env.GITHUB_EVENT_PATH = resolve(__dirname, `payloads/events/${event}.json`)
            context = new Context()
            // set event and inputs
            inputs['output'] = output
            inputs['fileOutput'] = fileOutput
            inputs['pushBefore'] = pushBefore
            inputs['prNumber'] = '1'
            inputSpy.mockImplementation(name => inputs[name]);

            // run test function
            iinputs = getInputs(context)

            // evaluate outputs
            if (event.includes('push')) {
              expect(iinputs.pushAfter).toBe(context.payload.after)
            }
            if (event.includes('pull_request') || event.includes('issue_comment')) {
              // synchronize gives before and after and PR number
              if (event === 'pull_request_synchronize') {
                expect(iinputs.pushAfter).toBe(context.payload.after)
              } else {
                expect(iinputs.pushAfter).toBeFalsy()
              }
            }
            expect(iinputs.prNumber).toBe(1)
            // if (!pushBefore) expect(iinputs.pushBefore).toBe(context.payload.before)
            // else expect(iinputs.pushBefore).toBe(pushBefore)
            expect(iinputs.githubToken).toBe(process.env['GITHUB_TOKEN'])
            expect(iinputs.githubRepo).toBe(process.env['GITHUB_REPOSITORY'])
            expect(iinputs.output).toBe(output)
            expect(iinputs.fileOutput).toBe(fileOutput)
            expect(core.error).not.toHaveBeenCalled()
          })
        })
      })
    })
    testOutputInputs.forEach(output => {
      testFileOutputInputs.forEach(fileOutput => {
        pushAfterInputs.forEach(pushAfter => {
// sets correct pushAfter and prNumber
          it(`${event} - sets correct pushAfter and prNumber inputs ["prNumber": "1", "pushAfter": "${pushAfter}", "output": "${output}", "fileOutput": "${fileOutput}"]`, () => {
            // context
            process.env.GITHUB_EVENT_PATH = resolve(__dirname, `payloads/events/${event}.json`)
            context = new Context()
            // set event and inputs
            inputs['output'] = output
            inputs['fileOutput'] = fileOutput
            inputs['pushAfter'] = pushAfter
            inputs['prNumber'] = '1'
            inputSpy.mockImplementation(name => inputs[name]);

            // run test function
            iinputs = getInputs(context)

            // evaluate outputs
            if (event.includes('push')) {
              expect(iinputs.pushBefore).toBe(context.payload.before)
            }
            if (event.includes('pull_request') || event.includes('issue_comment')) {
              // synchronize gives before and after and PR number
              if (event === 'pull_request_synchronize') {
                expect(iinputs.pushBefore).toBe(context.payload.before)
              } else {
                expect(iinputs.pushBefore).toBeFalsy()
              }
            }
            expect(iinputs.prNumber).toBe(1)
            // if (!pushAfter) expect(iinputs.pushAfter).toBe(context.payload.after)
            // else expect(iinputs.pushAfter).toBe(pushAfter)
            expect(iinputs.githubToken).toBe(process.env['GITHUB_TOKEN'])
            expect(iinputs.githubRepo).toBe(process.env['GITHUB_REPOSITORY'])
            expect(iinputs.output).toBe(output)
            expect(iinputs.fileOutput).toBe(fileOutput)
            expect(core.error).not.toHaveBeenCalled()
          })
        })
      })
    })
  })
})
