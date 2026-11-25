# Release the Testing package

Use Node.js 24 and npm from the repository root.

```sh
npm ci
npm test
```

The release build writes ESM, TypeScript declarations and fixture styles to `dist/package`. The test installs the packed artifact in a clean project, imports the Node helpers, exercises a native DOM selection, checks declarations and builds Vue fixtures with the published Core and Plain packages.

For maintainers, push a Git tag with the full package version and a `v` prefix. The workflow sends stable versions to `latest` and SemVer prereleases to `pre-release`. npm Trusted Publishing uses the `publish.yml` workflow and the GitHub `npm` environment.
