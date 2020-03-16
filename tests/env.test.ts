import { Env, p } from './mocks/env/env'
let env: Env // env object

describe('Testing Env object with pull_request event', () => {
  // create a brand new context object for each event test set
  beforeAll(() => {
    env = new Env({}, {}, 'pull_request_synchronize')
  })
  it('Env mocks Octokit.pulls.listFiles', () => {
    const request = p.OctokitPullsListFilesRequest
    const response = p.OctokitPullsListFilesResponse
    return env.githubMock.pulls.listFiles(request).then(data => {
      expect(data.data).toBe(response)
      expect(data.data.length).toBe(7)
    })
  })
  it('Env mocks Octokit.pulls.listFiles.endpoint.merge', () => {
    const request = p.OctokitPullsListFilesEndpointMergeRequest
    const response = p.OctokitPullsListFilesEndpointMergeResponse
    const data = env.githubMock.pulls.listFiles.endpoint.merge(request)
    expect(data).toStrictEqual(response)
  })
  it('Env mocks Octokit.repos.paginate for pr', () => {
    const request = p.OctokitPaginatePrRequest
    const response = p.OctokitPaginatePrResponse
    return env.githubMock.paginate(request).then(data => {
      expect(data).toStrictEqual(response)
      expect(data.length).toBe(7)
    })
  })
  it('Env mocks Octokit.repos.paginate for pr with custom callback', async () => {
    const request = p.OctokitPaginatePrRequest
    const response = p.OctokitPaginatePrResponse
    return env.githubMock.paginate(request, response => {
      return response.data
    }).then(data => {
      expect(data).toStrictEqual(response)
      expect(data.length).toBe(7)
    })
  })
})

describe('Testing Env object with push event', () => {
  // create a brand new context object for each event test set
  beforeAll(() => {
    env = new Env({}, {}, 'push')
  })
  it('Env mocks Octokit.repos.compareCommits', () => {
    const request = p.OctokitReposCompareCommitsRequest
    const response = p.OctokitReposCompareCommitsResponse
    return env.githubMock.repos.compareCommits(request).then(data => {
      expect(data.data.files).toBe(response)
      expect(data.data.files.length).toBe(7)
    })
  })
  it('Env mocks Octokit.repos.compareCommits.endpoint.merge', () => {
    const request = p.OctokitReposCompareCommitsEndpointMergeRequest
    const response = p.OctokitReposCompareCommitsEndpointMergeResponse
    const data = env.githubMock.repos.compareCommits.endpoint.merge(request)
    expect(data).toStrictEqual(response)
  })
  it('Env mocks Octokit.repos.paginate for push', async () => {
    const request = p.OctokitPaginatePushRequest
    const response = p.OctokitPaginatePushResponse
    return env.githubMock.paginate(request).then(data => {
      return data.map(commit => commit.files)
    })
  })
  it('Env mocks Octokit.repos.paginate for push with custom callback', async () => {
    const request = p.OctokitPaginatePushRequest
    const response = p.OctokitPaginatePushResponse
    let files = await env.githubMock.paginate(request, response => {
      return response.data.files
    })
    expect(files).toStrictEqual(response)
    expect(files.length).toBe(7)
  })
})
