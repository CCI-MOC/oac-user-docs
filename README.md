The repository hosts the content for <https://docs.oac.massopen.cloud>.

## Building locally

### Requirements

You will need to install [node.js].

[node.js]: https://nodejs.org/

### Installing dependencies

Run:

```sh
npm install
```

### Building the site

Run:

```
npm run serve
```

This will build the site in `_site` and serve it at <http://localhost:8080> (or the next higher available port, if port 8080 is already in use on your system).

```sh
$ npm run serve

> oac-user-docs@1.0.0 serve
> eleventy --watch --serve

[11ty] Writing ./_site/index.html from ./content/index.md (liquid)
[11ty] Writing ./_site/user-onboarding/index.html from ./content/user-onboarding/index.md (liquid)
[11ty] Copied 56 Wrote 2 files in 0.38 seconds (v3.1.6)
[11ty] Watching…
[11ty] Server at http://localhost:8080/
```

## Github workflows

When new content is pushed to the `main` branch, the `publish.yaml` GitHub workflow publishes the content to <https://docs.oac.massopen.cloud>. This workflow also generates a PDF version of the user onboarding docs.
