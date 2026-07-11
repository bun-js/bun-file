export function fail(msg: string | Error): never {
  throw msg instanceof Error ? msg : new Error(msg)
}
