// Import Request and Response Objects
import type { EndpointOptions, RequestOptions } from '@octokit/types'
import {
  // OctokitReposCompareCommitsEndpointMergeRequest,
  OctokitReposCompareCommitsEndpointMergeResponse,
  // OctokitPullsListFilesEndpointMergeRequest,
  OctokitPullsListFilesEndpointMergeResponse
} from '../payloads'
// Form and export Response Objects
export { OctokitReposCompareCommitsEndpointMergeResponse as pushResponse }
export { OctokitPullsListFilesEndpointMergeResponse as prResponse }
// Export mock function
export const fn = jest.fn((data: EndpointOptions ) => {
  if (
    (!data.base && !data.head && Number.isNaN(data.pull_number)) ||
    (!data.base && data.head) ||
    (data.base && !data.head)) return {...OctokitPullsListFilesEndpointMergeResponse, ...{pull_number: NaN, base: '', head: ''}} as RequestOptions
  if (data.pull_number) {
    return {...OctokitPullsListFilesEndpointMergeResponse, ...data} as RequestOptions
  } 
  return {...OctokitReposCompareCommitsEndpointMergeResponse, ...data} as RequestOptions
  
})