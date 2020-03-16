// Import Request and Response Objects
import {
  OctokitReposCompareCommitsRequest,
  OctokitReposCompareCommitsResponse
} from '../../../payloads/octokit'
import { EndpointOptions, OctokitResponse } from '@octokit/types'
// Form and export Response Objects
export { OctokitReposCompareCommitsResponse as response }
// Export mock function
export const fn = jest.fn((data: EndpointOptions) => {
  return Promise.resolve({
    data: {
      files: OctokitReposCompareCommitsResponse 
    }
  } as OctokitResponse<any>)
})