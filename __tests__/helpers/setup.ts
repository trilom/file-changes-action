import { resolve, join } from 'path'
import {readFileSync} from 'fs'
import * as dotenv from 'dotenv'

export const path = join(__dirname, '..')

export interface ProcessEnv {
  [key: string]: string | undefined
}

// init environment
export function initConfig(force: boolean = true, path?: string): void {
  if (process.env['GITHUB_REPOSITORY'] === 'trilom-test/file-changes-action' ||
      ! process.env['GITHUB_REPOSITORY']) {
    // path to root
    const realPath = path || resolve(__dirname, '..')
    // location of environment
    const envPath = resolve(realPath, ".env")
    // set environment
    dotenv.config({ path: envPath })
    // reset environment to file if force
    if (force) resetConfig(envPath)
    // set path vars to current path based on env + current
    const envVars = ['GITHUB_EVENT_PATH', 'HOME', 'GITHUB_WORKSPACE']
    envVars.forEach(s => {
      if (!process.env[s]?.includes(realPath)) process.env[s] = join(realPath, process.env[s] || '')
    })
  }
}
async function resetConfig(path: string): Promise<void> {
  const envConfig = dotenv.parse(readFileSync(path))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
}