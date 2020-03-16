// Import Request and Response Objects
import {
  OctokitReposCompareCommitsEndpointMergeRequest,
  OctokitReposCompareCommitsEndpointMergeResponse,
  OctokitPullsListFilesEndpointMergeRequest,
  OctokitPullsListFilesEndpointMergeResponse
} from '../../../payloads/octokit'
import { EndpointOptions, RequestOptions } from '@octokit/types'
// Form and export Response Objects
export { OctokitReposCompareCommitsEndpointMergeResponse as pushResponse }
export { OctokitPullsListFilesEndpointMergeResponse as prResponse }
// Export mock function
export const fn = jest.fn((data: EndpointOptions ) => {
  if (
    (!data.base && !data.head && isNaN(data.pull_number)) ||
    (!data.base && data.head) ||
    (data.base && !data.head)) return {...OctokitPullsListFilesEndpointMergeResponse, ...{pull_number: NaN, base: '', head: ''}} as RequestOptions
  if (data.pull_number) {
    return {...OctokitPullsListFilesEndpointMergeResponse, ...data} as RequestOptions
  } else {
    return {...OctokitReposCompareCommitsEndpointMergeResponse, ...data} as RequestOptions
  }
})