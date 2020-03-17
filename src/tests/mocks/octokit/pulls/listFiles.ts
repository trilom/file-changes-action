// Import Request and Response Objects
import type { EndpointOptions, OctokitResponse } from '@octokit/types'
import {
  // OctokitPullsListFilesRequest,
  OctokitPullsListFilesResponse
} from '../payloads'
// Form and export Response Objects
export { OctokitPullsListFilesResponse as response }
// Export mock function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fn = jest.fn((data: EndpointOptions) => {
  return Promise.resolve({
    data: OctokitPullsListFilesResponse
  } as OctokitResponse<any>)
})
