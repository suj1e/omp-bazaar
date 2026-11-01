# Release readiness

A practical release decision skill for omp. It gathers the facts needed to ship a specified revision and makes missing evidence visible.

## What is included

The `release-readiness` skill guides acceptance mapping, verification records, compatibility review, rollout and rollback planning, and a go / no-go recommendation. It is a written method. It does not deploy software, schedule work, monitor systems, or provide a security boundary.

## Install

In an omp session:

```text
/marketplace add suj1e/omp-bazaar
/marketplace install release-readiness@omp-bazaar
/reload-plugins
```

Installation defaults to user scope. Use `--scope project` on the install command for a project-only copy. An enabled project copy shadows the same user-scoped plugin.

## Use it

Ask omp to use the `release-readiness` skill and supply the release revision, acceptance criteria, deployment target, and allowed verification. Example task input:

```text
Use release-readiness for revision abc1234, targeting the staging web app.
Acceptance: sign-in, saved searches, and existing exported links keep working.
Read the repository's release instructions and current CI results.
You may run local unit tests; do not deploy or contact production.
Produce a readiness decision with evidence, blockers, rollout and rollback steps.
Treat absent migration rehearsal evidence as unknown, not passed.
```

Replace the example revision with your real revision. The skill needs repository access and the release's actual acceptance criteria. Deployment-specific claims require your deployment documentation or authorized access to relevant evidence.

## Expected result

A release identity, requirement-to-evidence table, explicit blockers, a target-specific rollout and rollback plan, and a recommendation with confidence limits. An unknown mandatory check blocks a go recommendation unless the responsible owner explicitly accepts that risk. The skill cannot approve a release on an owner's behalf.

## Update and reload

```text
/marketplace update omp-bazaar
/marketplace upgrade release-readiness@omp-bazaar
/reload-plugins
```

Marketplace update refreshes the catalog; plugin upgrade replaces the installed content. TUI marketplace changes need `/reload-plugins` to refresh skills; restarting also works. Newly installed non-MCP tools, hooks, or extension modules need a session restart, but this plugin includes none. If both scopes are installed, specify `--scope user` or `--scope project` when upgrading in the TUI.

## Source and license

[Read the complete skill](https://github.com/suj1e/omp-bazaar/blob/main/plugins/release-readiness/skills/release-readiness/SKILL.md). Maintained by suj1e under the [MIT license](https://github.com/suj1e/omp-bazaar/blob/main/LICENSE).
