import {Env, eventName, formatInput, getTestEvents, getTestFiles, p} from '.'

let env: Env

describe('Testing Env object with push event...', () => {
  it('...Env sets push as default event', () => {
    env = new Env({}, {})
    expect(process.env.GITHUB_EVENT_NAME).toBe('push')
  })
})

describe.each(p.testEvents)('Testing Env object with %s event...', event => {
  beforeAll(() => {
    env = new Env({}, {}, event)
  })
  it('...Env can get correct test file inputs', () => {
    const {files, stats} = getTestFiles()
    const filesCount =
      Object.values(stats).reduce((prev, curr) => prev + curr) / 2
    expect(files.length).toBe(73)
    expect(filesCount).toBe(73)
    expect(stats.files).toStrictEqual(73)
    expect(stats.files).toStrictEqual(filesCount)
  })
  it('...Env can get custom files', () => {
    const {files, stats} = getTestFiles([
      '/test/test',
      '/test1/test1',
      '/test2/test2',
      '/test3/test3'
    ])
    const filesCount =
      Object.values(stats).reduce((prev, curr) => prev + curr) / 2
    expect(files.length).toBe(4)
    expect(filesCount).toBe(4)
    expect(stats.files).toStrictEqual(4)
    expect(stats.files).toStrictEqual(filesCount)
  })
  it('...Env can get custom file properties', () => {
    const {files, stats} = getTestFiles(
      ['/test/test', '/test1/test1', '/test2/test2', '/test3/test3'],
      {files: 0, test: 0, test1: 0, test2: 0, test3: 0}
    )
    const filesCount =
      Object.values(stats).reduce((prev, curr) => prev + curr) / 2
    expect(files.length).toBe(4)
    expect(filesCount).toBe(4)
    expect(stats.files).toStrictEqual(4)
    expect(stats.files).toStrictEqual(filesCount)
  })
  it('...Env can get custom files limited', () => {
    const {files, stats} = getTestFiles(
      [
        '/test/test',
        '/test1/test1',
        '/test2/test2',
        '/test3/test3',
        '/test4/test4',
        '/test5/test5',
        '/test6/test6',
        '/test7/test7'
      ],
      {files: 0, added: 0, removed: 0, modified: 0},
      4
    )
    const filesCount =
      Object.values(stats).reduce((prev, curr) => prev + curr) / 2
    expect(files.length).toBe(4)
    expect(filesCount).toBe(8) // this is 8 because it doesnt update the stats object
    expect(stats.files).toStrictEqual(8) // this is 8 because it doesnt update the stats object
    expect(stats.files).toStrictEqual(filesCount)
  })
  it('...Env can get correct test event inputs', () => {
    const initClientTestInputs = [
      {inputs: ['test include all'], events: 'all'},
      {inputs: ['test exclude string'], events: 'tall'},
      {inputs: ['test include string'], events: event},
      {inputs: ['test include array'], events: [event, 'tall']},
      {inputs: ['test exclude array'], events: ['handsome', 'dark', 'tall']}
    ]
    const result = getTestEvents(initClientTestInputs, event)
    expect(result.length).toBe(3)
  })
  it('...Env can get correct process.env.GITHUB_EVENT_NAME', () => {
    const result = eventName(event)
    if (result.includes('push')) expect(result).toBe('push')
    else if (result.includes('pull_request'))
      expect(result).toBe('pull_request')
    else if (result.includes('issue_comment'))
      expect(result).toBe('issue_comment')
    else expect(result).toBe(result.trim())
  })
  it('...Env can format strings for action process.env.INPUT_INPUTNAME', () => {
    const input = {test: 'value', REALtest: 'realVALUE', [event]: event}
    const result = formatInput(input)
    expect(result).toStrictEqual({
      INPUT_TEST: 'value',
      INPUT_REALTEST: 'realVALUE',
      [`INPUT_${event.replace(/ /g, '_').toUpperCase()}`]: event
    })
  })
  it('...Env can updateInput for action in process.env.INPUT_INPUTNAME without a new object', () => {
    env = new Env({}, {test_input: 'test_value'}, event)
    expect(process.env.INPUT_TEST_INPUT).toEqual('test_value')
    env.updateInput({test_input: 'new_value'})
    expect(process.env.INPUT_TEST_INPUT).toEqual('new_value')
    delete process.env.INPUT_TEST_INPUT
  })
  it('...Env can return an unmocked environment', () => {
    const tenv = new Env({}, {}, event, false)
    expect(tenv.coreMock).toMatchObject({})
    expect(tenv.coreMock).not.toMatchObject(env.coreMock)
    expect(tenv.fsMock).toMatchObject({})
    expect(tenv.fsMock).not.toMatchObject(env.fsMock)
    expect(tenv.githubMock).toMatchObject({})
    expect(tenv.githubMock).not.toMatchObject(env.githubMock)
    expect(tenv.octokitMock).toMatchObject({})
    expect(tenv.octokitMock).not.toMatchObject(env.octokitMock)
  })
  it('...Env can update input for an unmocked environment', () => {
    const tenv = new Env({}, {test_input: 'test_value'}, event, false)
    expect(process.env.INPUT_TEST_INPUT).toEqual('test_value')
    env.updateInput({test_input: 'new_value'}, false)
    expect(process.env.INPUT_TEST_INPUT).toEqual('new_value')
    expect(tenv.coreMock).toMatchObject({})
    expect(tenv.coreMock).not.toMatchObject(env.coreMock)
    expect(tenv.fsMock).toMatchObject({})
    expect(tenv.fsMock).not.toMatchObject(env.fsMock)
    expect(tenv.githubMock).toMatchObject({})
    expect(tenv.githubMock).not.toMatchObject(env.githubMock)
    expect(tenv.octokitMock).toMatchObject({})
    expect(tenv.octokitMock).not.toMatchObject(env.octokitMock)
  })
  if (event === 'push') {
    it('...Env mocks Octokit.pulls.listFiles', () => {
      // console.log(JSON.stringify(env))
      const request = p.OctokitPullsListFilesRequest
      const response = p.OctokitPullsListFilesResponse
      return env.octokitMock.pulls.listFiles(request).then(data => {
        expect(data.data).toBe(response)
        return expect(data.data.length).toBe(7)
      })
    })
    it('...Env mocks Octokit.pulls.listFiles.endpoint.merge', () => {
      const request = p.OctokitPullsListFilesEndpointMergeRequest
      const response = p.OctokitPullsListFilesEndpointMergeResponse
      const data = env.octokitMock.pulls.listFiles.endpoint.merge(request)
      expect(data).toStrictEqual(response)
    })
    it('...Env mocks Octokit.repos.paginate for pr', () => {
      const request = p.OctokitPaginatePrRequest
      const response = p.OctokitPaginatePrResponse
      return env.octokitMock.paginate(request).then(data => {
        expect(data).toStrictEqual(response)
        return expect(data.length).toBe(7)
      })
    })
    it('...Env mocks Octokit.repos.paginate for pr with custom callback', async () => {
      const request = p.OctokitPaginatePrRequest
      const response = p.OctokitPaginatePrResponse
      return env.octokitMock
        .paginate(request, res => {
          return res.data
        })
        .then(data => {
          expect(data).toStrictEqual(response)
          return expect(data.length).toBe(7)
        })
    })
  }
  if (event === 'pull_request_synchronize') {
    it('...Env mocks Octokit.repos.compareCommits', () => {
      const request = p.OctokitReposCompareCommitsRequest
      const response = p.OctokitReposCompareCommitsResponse
      return env.octokitMock.repos.compareCommits(request).then(data => {
        expect(data.data.files).toBe(response)
        return expect(data.data.files.length).toBe(7)
      })
    })
    it('...Env mocks Octokit.repos.compareCommits.endpoint.merge', () => {
      const request = p.OctokitReposCompareCommitsEndpointMergeRequest
      const response = p.OctokitReposCompareCommitsEndpointMergeResponse
      const data = env.octokitMock.repos.compareCommits.endpoint.merge(request)
      expect(data).toStrictEqual(response)
    })
    it('...Env mocks Octokit.repos.paginate for push', async () => {
      const request = p.OctokitPaginatePushRequest
      const response = p.OctokitPaginatePushResponse
      expect.assertions(1)
      const files = await env.octokitMock.paginate(request).then(data => {
        return data.map(commit => commit.files)
      })
      expect(files).toStrictEqual([response])
    })
    it('...Env mocks Octokit.repos.paginate for push with custom callback', async () => {
      const request = p.OctokitPaginatePushRequest
      const response = p.OctokitPaginatePushResponse
      const files = await env.octokitMock.paginate(request, res => {
        return res.data.files
      })
      expect(files).toStrictEqual(response)
      expect(files.length).toBe(7)
    })
  }
})
