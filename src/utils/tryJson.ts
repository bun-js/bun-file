export function tryJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
