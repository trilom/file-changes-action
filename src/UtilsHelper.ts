export interface ActionError {
  error: string
  from: string
  message: string
  payload: string
}
export function getErrorString(
  name: string,
  status = 500,
  from: string,
  message: string,
  error: any = ''
): string {
  const test = JSON.stringify({
    error: `${status}/${name}`,
    from,
    message,
    payload: error
  } as ActionError, null, 2)
  return test
}