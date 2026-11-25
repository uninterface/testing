# Release the Testing package

Use Node.js 24 and npm from the repository root.

```sh
npm ci
npm test
```

The release build writes ESM, TypeScript declarations and fixture styles to `dist/package`. The test installs the packed artifact in a clean project, imports the Node helpers, exercises a native DOM selection, checks declarations and builds Vue fixtures with the published Core and Plain packages.

For the first release, run **Publish Testing to npm** in GitHub Actions with **stage** unchecked. Extract `uninterface-testing-npm-package`, then verify and stage the tarball from an npm maintainer account.

```sh
sha512sum --check SHA512SUMS &&
  npm stage publish ./testing.tgz --access public --tag latest
npm stage list @uninterface/testing
npm stage approve <stage-id>
```

After approving the first release, configure npm Trusted Publishing for `uninterface/testing`, workflow `publish.yml`, and environment `npm`. Enable `npm publish` for Git tag releases and `npm stage publish` for manual staging. Push a Git tag that matches the package version with a `v` prefix. The workflow sends plain versions to `latest` and SemVer prereleases to `pre-release`.
