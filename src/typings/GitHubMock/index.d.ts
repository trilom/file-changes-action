import type { Context } from '@actions/github/lib/context'
import type { OctokitMock } from 'typings/OctokitMock'

export interface GitHubMock {
  GitHub: (token: string) => OctokitMock | OctokitMock
  context: Context
}