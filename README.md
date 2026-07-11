# bun-file

[![npm version](https://img.shields.io/npm/v/%40bunx%2Ffile?style=flat-square)](https://www.npmjs.com/package/@bunx/file)
[![npm downloads](https://img.shields.io/npm/dm/%40bunx%2Ffile?style=flat-square)](https://www.npmjs.com/package/@bunx/file)
[![license](https://img.shields.io/npm/l/%40bunx%2Ffile?style=flat-square)](./LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun%20%3E%3D1.3.14-f9f1e1?style=flat-square&logo=bun&logoColor=000)](https://bun.sh)

Read and write the file formats supported natively by [Bun](https://bun.sh), from a small CLI or a TypeScript import.

`bun-file` is intentionally Bun-only. The package publishes its TypeScript source directly—there is no `dist` directory or build step.

## Requirements

- [Bun](https://bun.sh) 1.3.14 or newer

## Installation

```sh
bun add @bunx/file
```

## CLI

The executable is called `bun-file`.

For one-off commands, run it directly with `bunx` without installing the package:

```sh
# Read a file and print its parsed value
bunx @bunx/file config.toml

# Convert stdin to JSON
cat config.yaml | bunx @bunx/file --type yaml --format json

# Write the converted value to a file
bunx @bunx/file config.toml --format json --output config.json
```

```sh
# Read a file and print its parsed value
bun-file config.toml

# Convert stdin to JSON
cat config.yaml | bun-file --type yaml --format json

# Write the converted value to a file
bun-file config.toml --format json --output config.json
```

When reading a file, the input type is inferred from its extension. For stdin, provide `--type`.

### Supported formats

| Format | Read | Write |
| --- | :---: | :---: |
| TOML | ✓ |  |
| YAML | ✓ | ✓ |
| JSON | ✓ | ✓ |
| JSONC | ✓ |  |
| JSON5 | ✓ |  |
| JSONL | ✓ | ✓ |
| JSC | ✓ | ✓ |

TOML can be read, but Bun does not provide a native TOML serializer, so TOML output is not supported.

Run `bun-file --help` for all options:

```text
bun-file [options] <input> [output]
```

## API

The package exports the CLI entry point for use in Bun applications:

```ts
import { cli } from "@bunx/file"

await cli(["config.toml", "--format", "json"])
```

The default CLI executable is also available in the package's `bin` directory for Bun to run directly.

## Development

```sh
bun install
bun test
bun run check
```

## Publishing

This package does not require a compilation step. `bun publish` publishes the TypeScript source listed in `package.json`'s `files` field.

With Mise installed, publish it with:

```sh
mise run publish
```

### GitHub Actions

The repository uses [Release Please](https://github.com/googleapis/release-please) to keep package versions, changelogs, and GitHub Releases synchronized:

1. Merge changes using [Conventional Commits](https://www.conventionalcommits.org/), such as `fix: handle empty input` or `feat: add jsonl output`.
2. Release Please opens or updates a release PR on `main`.
3. Merge the release PR to create the GitHub Release.
4. The [publish workflow](./.github/workflows/publish.yml) validates the release tag against `package.json`, runs the checks, and publishes to npm.

For secure, tokenless publishing, configure npm Trusted Publishing for the repository and `publish.yml`. The workflow requests the required GitHub OIDC permission and npm generates provenance automatically.

## License

[MIT](./LICENSE)
