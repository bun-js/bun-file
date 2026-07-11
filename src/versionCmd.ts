import { name, version } from "../package.json"

export function versionCmd(): string {
  return `${name} version: ${version}`
}
