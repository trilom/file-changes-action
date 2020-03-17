import {setFailed} from '@actions/core'
import * as t from '@actions/core'
import {ActionError} from './typings/ActionError'

export function getErrorString(
  name: string,
  status = 500,
  from: string,
  message: string,
  error: any = ''
): string {
  try {
    const test = JSON.stringify({
      error: `${status}/${name}`,
      from,
      message,
      payload: error
    } as ActionError, null, 2)
    return test
  } catch (error_) {
    setFailed(`Error throwing error.\n ${JSON.stringify(error_.message)}`)
    throw(new Error(JSON.stringify({name: '500/undefined', message: 'Error throwing error.'})))
  }
}