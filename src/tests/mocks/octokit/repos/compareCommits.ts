// Import Request and Response Objects
import type { EndpointOptions, OctokitResponse } from '@octokit/types'
import {
  // OctokitReposCompareCommitsRequest,
  OctokitReposCompareCommitsResponse
} from '../payloads'
// Form and export Response Objects
export { OctokitReposCompareCommitsResponse as response }
// Export mock function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fn = jest.fn((data: EndpointOptions) => {
  return Promise.resolve({
    data: {
      files: OctokitReposCompareCommitsResponse 
    }
  } as OctokitResponse<any>)
})