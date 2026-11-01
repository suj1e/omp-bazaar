# omp bazaar

Small, deliberate skills for evidence-led work in omp. The marketplace and the static site share one catalog: [`.omp-plugin/marketplace.json`](.omp-plugin/marketplace.json).

- Website: [ompbazaar.beer](https://ompbazaar.beer)
- Marketplace: `suj1e/omp-bazaar`
- Maintainer: [suj1e](https://github.com/suj1e)
- License: [MIT](LICENSE)

## Install in omp

```text
/marketplace add suj1e/omp-bazaar
/marketplace install review-evidence@omp-bazaar
/reload-plugins
```

Or install `release-readiness@omp-bazaar`. Installation defaults to user scope. Add `--scope project` to keep an install project-local. An enabled project copy shadows an enabled user copy of the same plugin.

Command-line equivalents:

```sh
omp plugin marketplace add suj1e/omp-bazaar
omp plugin install review-evidence@omp-bazaar
```

If the TUI is already open, reload its plugins after CLI changes. You need omp and GitHub network access. Read plugin source before installing.

## Included plugins

These are real, self-maintained skill-only plugins, not executable analyzers or deployment services.

- [review-evidence](plugins/review-evidence/README.md): scope a review, trace requirements and findings to actual code or observed results, and record verification limits.
- [release-readiness](plugins/release-readiness/README.md): build a release evidence ledger and target-specific rollout/rollback plan, then recommend go or no-go without deploying.

Each plugin contains an installable `skills/<name>/SKILL.md` with frontmatter, an actionable method, concrete input guidance, and an output contract. Ask omp to use the skill by name and provide your actual revision, requirements, and authorized checks. These skills do not install tools, schedule work, enforce isolation, or guarantee correctness. They inherit the session's permissions; they do not authorize tests or production access by themselves.

## Updating is two separate actions

```text
/marketplace update omp-bazaar
/marketplace upgrade review-evidence@omp-bazaar
/reload-plugins
```

`update` refreshes the marketplace catalog only. `upgrade` replaces installed plugin content. In the TUI, use `--scope user` or `--scope project` if both copies are installed. A named CLI `omp plugin upgrade name@omp-bazaar` without scope reinstalls every installed scope.

TUI marketplace mutations update disk state but do not refresh the active session. `/reload-plugins` refreshes skills, slash commands, task agents, and MCP servers; starting a new session also works. Newly installed non-MCP tools, hooks, or extension modules require a session restart. This repository ships none of those. ACP/RPC refresh skills and slash commands automatically, but do not reconnect MCP servers or rebuild every initialized capability.

## Website development

Use Node.js 22 or newer:

```sh
npm ci
npm run check
npm run build
```

The output is `dist/`, which is intentionally ignored. To serve a GitHub project path instead of the domain root:

```sh
BASE_PATH=/omp-bazaar/ npm run build
```

For a local preview, serve `dist/` using a static server of your choice. For the custom domain and a local root build, leave `BASE_PATH` empty. `site/config.mjs` owns the production origin and domain. The builder prefixes every local navigation/resource URL, emits individual plugin pages and an installation guide, and generates `404.html`, `sitemap.xml`, `robots.txt`, favicon, and `.nojekyll`. The custom domain is configured in GitHub Pages settings/API; no DNS credentials or external plugin downloads belong in CI.

The site reads the catalog and each plugin's real README. It never installs or executes a plugin. `marked` renders README content with raw HTML escaped, HTTPS-only links, and images rendered as alt text. There are no remote fonts, analytics, or asset requests. Search and category filtering are immediate and URL-addressable; without JavaScript the complete collection and all documentation remain readable. Clipboard failures give a visible manual-copy path.

### Validation

`npm run check` runs behavioral Node tests and validates both domain-root and `/omp-bazaar/` output in memory. Validation covers catalog identity, case-insensitive plugin names, exact install sources, real paths/symlink boundaries, versions, documentation, skill entry points/frontmatter, and generated local links/anchors/assets. Tests exercise valid rendering and deliberately invalid fixtures; they do not assert against source-code strings or execute plugin content.

Before release, manually inspect desktop and mobile layouts, keyboard navigation, search/category/no-results/reset, clipboard success/failure, direct detail routes, 404, reduced motion, and background-tab particle suspension. The tiny canvas caps particles and device pixel ratio and suspends on `document.hidden`; system reduced-motion disables it. Browser interaction checks require a browser and are separate from the Node checks.

### Release verification

Both published plugins were installed from `suj1e/omp-bazaar` in an isolated omp 18.14.2 profile. Chromium checks exercised search, category filtering, empty states, direct plugin pages, clipboard success and failure, mobile navigation, and reduced-motion mode. Canvas frames changed while motion was enabled, and animations were disabled when reduced motion was requested.


## Contribute a plugin

1. Create a directory under `plugins/` containing a substantive README and at least one `skills/<name>/SKILL.md`. Use a lowercase hyphenated skill name and matching `name` frontmatter with a meaningful `description`.
2. Document what the skill really does, required task inputs, usable examples, expected output, installation, update/reload behavior, and limitations. Do not claim automation, isolation, popularity, or integrations that are not implemented.
3. Add one entry to `.omp-plugin/marketplace.json`. Use a unique case-insensitive plugin name, explicit semantic version, `source: "./plugins/<directory>"`, author, category, tags, MIT license, and correct source/homepage URLs. The catalog is the only plugin directory data source; do not add a parallel website list.
4. Use the existing written-skill structure. New executable components require a separately reviewed design and corresponding validation; the current collection intentionally includes only skills.
5. Run `npm run check` and `npm run build`. Open a pull request with the problem, real usage example, capability limits, and verification actually performed. Do not include secrets or generated `dist/`.

Changes to a published plugin require a version bump in its catalog entry so all-plugin upgrades can recognize the new content. Check the complete skill method and affected documentation together. Report bugs through [GitHub issues](https://github.com/suj1e/omp-bazaar/issues) with a redacted task, exact command, omp version, and observed behavior.

## Publishing

The Pages workflow checks and builds pull requests with read-only permissions. It uploads/deploys only successful builds on `main` (including manual runs on `main`). Deployment uses official Pages actions, the `github-pages` environment, and a serialized deployment concurrency group. Plugin content is read as text, never executed by validation or build. `npm ci --ignore-scripts` also suppresses dependency lifecycle scripts in CI.

Repository administration, Pages enablement, custom-domain verification, DNS, and HTTPS provisioning must be performed by the repository/domain owner. Configure GitHub Pages to use GitHub Actions and `ompbazaar.beer`; point DNS at the repository's GitHub Pages host using GitHub's documented apex-domain records. Domain verification and certificate issuance depend on GitHub and DNS propagation, not this build. Keep credentials out of this repository.

The separate **Finalize HTTPS** workflow runs after successful Pages deployments, hourly, and on manual dispatch. It checks GitHub's certificate state before enabling HTTPS, verifies the saved setting after enabling it, and records a pending certificate honestly in the job summary. GitHub controls issuance; no DNS API key is needed. Once HTTPS is already enforced, the workflow only reads the state.
