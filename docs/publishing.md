# Publishing Guide

This document describes the complete release process for `@bunx/file`, a Bun-only npm package whose TypeScript source is published directly without a `dist` build.

## Release architecture

The repository uses two GitHub Actions workflows:

1. `release-please.yml` watches `main` and creates a release PR from Conventional Commit history.
2. `publish.yml` runs when a GitHub Release is published, validates the release version, runs the checks, and publishes to npm using Trusted Publishing and OIDC.
3. `build-release-assets.yml` runs for the same GitHub Release, cross-compiles standalone Bun executables, and uploads them as release assets.

The normal flow is:

```text
feature PRs
    ↓
merge Conventional Commits to main
    ↓
Release Please release PR
    ↓ merge
GitHub Release and version tag
    ↓
publish.yml
    ↓
npm publish with OIDC and provenance
    ↓
build-release-assets.yml
    ↓
platform-specific GitHub Release binaries
```

The release tag is not trusted by itself. Before publishing, the workflow checks that the tag exactly matches the version in `package.json`:

```text
release tag:     v0.0.5
package version: 0.0.5
```

This prevents a release from publishing a different version than the one reviewed in the release PR.

## Package configuration

The package must contain the following metadata:

```json
{
  "name": "@bunx/file",
  "version": "0.0.5",
  "type": "module",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/bun-js/bun-file.git"
  },
  "engines": {
    "bun": ">=1.3.14"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### Why these fields matter

- `name` identifies the npm package and its npm scope.
- `version` is the release version and must match the GitHub release tag.
- `type: module` enables the package's ESM imports.
- `repository.url` must exactly match the GitHub repository URL. npm uses it to validate provenance metadata.
- `engines.bun` documents the runtime requirement for consumers.
- `publishConfig.access: public` makes the scoped package public. Scoped packages are private by default unless public access is explicitly configured.

The `files` field should include only publishable files. This project intentionally publishes `src` and does not generate or publish `dist`:

```json
"files": [
  "bin",
  "src",
  "README.md",
  "LICENSE"
]
```

Verify the package contents before a release:

```sh
bun publish --dry-run
```

## npm scope setup

`@bunx/file` is an organization-scoped package. The `bunx` npm organization must exist, and the npm account performing the first publish must have permission to publish packages in that organization.

For a user-scoped package, the scope must instead match the npm username, for example `@username/file`.

Check the package metadata after publishing:

```sh
npm view @bunx/file version dist-tags --json
```

For a new public scoped package, npm requires public access. This repository sets it through `publishConfig`, but the equivalent command is:

```sh
npm publish --access public
```

## First publish bootstrap

Trusted Publishing is used for subsequent GitHub Actions releases. The package must first exist on npm so its package settings can be configured.

For the initial version only:

1. Create or confirm the npm scope.
2. Authenticate locally with an npm account that can publish in that scope.
3. Run the test and package checks.
4. Publish the first version manually.
5. Configure the npm Trusted Publisher for the package.
6. Remove or avoid long-lived publishing tokens from CI.

Example local bootstrap:

```sh
npm login
bun test
bun run check
bun publish --dry-run
npm publish --access public
```

The exact authentication method may require npm 2FA or a granular access token with permission to publish. Do not commit an npm token or place it in the repository.

## npm Trusted Publishing

After the package exists, configure a Trusted Publisher in the package's npm settings:

1. Open the package on npm.
2. Open **Settings** → **Trusted Publisher**.
3. Choose **GitHub Actions**.
4. Enter these exact values:

   - Organization or user: `bun-js`
   - Repository: `bun-file`
   - Workflow filename: `publish.yml`
   - Environment: empty unless the workflow is changed to use one
   - Allowed action: `npm publish`

Enter only `publish.yml` as the workflow filename, not `.github/workflows/publish.yml`.

The publish workflow must grant GitHub's OIDC token permission:

```yaml
permissions:
  contents: read
  id-token: write
```

npm Trusted Publishing uses a short-lived OIDC credential instead of a long-lived npm token. npm also generates the provenance attestation automatically when the package is published from a public GitHub repository through Trusted Publishing.

For maximum protection, select npm's package setting:

> Require two-factor authentication and disallow tokens

This prevents traditional npm access tokens from publishing while still allowing the configured OIDC Trusted Publisher to publish.

## Mise configuration

`mise.toml` manages the Bun-only development tools:

```toml
[tools]
bun = "1.3.14"
biome = "2.5.3"
```

Node.js and npm are deliberately not managed by Mise. The publish workflow installs them only for the final npm publish step because npm Trusted Publishing is implemented by the npm CLI.

Local development commands:

```sh
mise install
mise run check
```

The repository's `check` task runs formatting/package checks, Knip, tests, TypeScript, and Biome.

## Release Please configuration

The release workflow is `.github/workflows/release-please.yml`:

```yaml
on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write
```

Release Please uses `release-type: node`, which reads and updates the version in `package.json`, creates a changelog, creates a release PR, and creates a GitHub Release after that PR is merged.

Use Conventional Commit messages so Release Please can determine the version bump:

```text
fix: handle empty input       → patch release
feat: add a new output mode   → minor release
feat!: change the CLI API     → major release
```

If GitHub reports that Actions cannot create pull requests, enable this repository setting:

**Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**

The workflow already requests `pull-requests: write`, but the repository-level setting must also allow the operation.

## Publish workflow

The publish workflow is `.github/workflows/publish.yml`. It runs only when a GitHub Release is published:

```yaml
on:
  release:
    types: [published]
```

The workflow performs these steps:

1. Checks out the release tag.
2. Installs the repository's Bun tools with `jdx/mise-action`.
3. Verifies the release tag matches `package.json`.
4. Installs dependencies with the frozen Bun lockfile.
5. Runs tests, TypeScript, and Biome.
6. Installs Node.js 24 and npm through `actions/setup-node`.
7. Runs `npm publish` using the GitHub OIDC identity.

The workflow does not use `NPM_TOKEN`. npm's Trusted Publisher configuration supplies the short-lived publish authorization.

## Standalone binary assets

`build-release-assets.yml` compiles `bin/bun-file` with Bun's `--compile` option and uploads five assets to every published GitHub Release:

```text
bun-file-linux-x64
bun-file-linux-arm64
bun-file-darwin-x64
bun-file-darwin-arm64
bun-file-windows-x64.exe
```

The workflow uses Bun cross-compilation targets, so all targets can be built on an Ubuntu runner. The generated executables include the Bun runtime and do not require Bun to be installed on the user's machine.

The binary workflow needs `contents: write` so `gh release upload` can attach assets to the release. It does not need npm credentials or `id-token: write`.

## Normal release procedure

### 1. Prepare a change

Use a Conventional Commit in the pull request title or commit history:

```sh
git commit -m "fix: handle malformed jsonl input"
```

Merge the pull request into `main`.

### 2. Review the Release Please PR

Release Please should open a release PR containing:

- The new `package.json` version
- Changelog updates
- Release metadata

Review the proposed version and changelog, then merge the release PR.

### 3. Confirm the GitHub Release

After the release PR merges, Release Please creates a GitHub Release with a matching tag, for example `v0.0.6`.

The publishing workflow starts when that release is published.

### 4. Verify the publish

Monitor the workflow:

```sh
gh run list --repo bun-js/bun-file --limit 5
gh run watch <run-id> --repo bun-js/bun-file
```

Verify npm metadata:

```sh
npm view @bunx/file version dist-tags --json
npm view @bunx/file@0.0.6 dist.tarball
```

Verify the package can be used through Bun:

```sh
bunx @bunx/file --help
```

## Manual recovery

If validation passed but npm publishing failed, do not create another version immediately. Inspect the failed publish step first:

```sh
gh run view <run-id> --repo bun-js/bun-file --log-failed
```

If the failure was caused by a temporary npm or GitHub issue, rerun the failed workflow:

```sh
gh run rerun <run-id> --repo bun-js/bun-file --failed
```

If the version was not published, a corrected release can use that same version. If npm accepted the version, create a new version instead; npm versions are immutable.

## Troubleshooting

### `404 Not Found` from npm during publish

Check the following:

- The npm scope exists and the publisher has write access.
- The package is configured as a public scoped package.
- The Trusted Publisher is configured for the correct package.
- The repository is `bun-js/bun-file`.
- The workflow filename is exactly `publish.yml`.
- The workflow has `id-token: write`.

### Provenance repository mismatch

If npm reports that `repository.url` is empty or does not match the provenance repository, add:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/bun-js/bun-file.git"
}
```

Commit the metadata change and publish a new version if the previous version was already accepted by npm.

### Release Please does not create a release PR

Check:

- The push was made to `main`.
- The commit uses a supported Conventional Commit type.
- The Release Please workflow completed successfully.
- GitHub Actions is allowed to create pull requests.
- The workflow has `contents: write` and `pull-requests: write`.

### `npm view` returns an old version immediately after publishing

npm registry metadata can take a short time to propagate. Query the registry directly or retry after a short delay:

```sh
curl -sS https://registry.npmjs.org/@bunx%2Ffile | jq '."dist-tags"'
```

### `bun publish` versus `npm publish`

`bun publish` works for local publishing and token-based CI publishing. This repository uses `npm publish` in GitHub Actions because npm Trusted Publishing and automatic provenance are implemented by the npm CLI.

## Security checklist

Before enabling automated publishing, verify:

- [ ] The package is public and uses the intended npm scope.
- [ ] `repository.url` exactly matches the GitHub repository.
- [ ] The Trusted Publisher is restricted to `bun-js/bun-file` and `publish.yml`.
- [ ] `id-token: write` is present only on the publishing workflow.
- [ ] No npm token is stored in the repository.
- [ ] GitHub Actions can create release PRs only if that permission is intentionally enabled.
- [ ] Release tags are protected or releases are otherwise restricted to maintainers.
- [ ] The package contents have been reviewed with `bun publish --dry-run`.
- [ ] Tests and type-checking pass before publishing.

## References

- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm scoped packages](https://docs.npmjs.com/misc/scope/)
- [npm publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [GitHub Actions release events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Release Please](https://github.com/googleapis/release-please)
- [Mise continuous integration](https://mise.jdx.dev/continuous-integration.html)
