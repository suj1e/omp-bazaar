# Review evidence

A structured review skill for omp. It helps you decide whether a concrete change meets its requirements, not whether it merely looks plausible.

## What is included

The `review-evidence` skill guides change scoping, requirement tracing, failure-path inspection, evidence collection, and a concise findings report. It is a written method, not an executable analyzer, sandbox, or background service. It does not promise to discover every defect.

## Install

In an omp session:

```text
/marketplace add suj1e/omp-bazaar
/marketplace install review-evidence@omp-bazaar
/reload-plugins
```

The default scope is your user. Add `--scope project` to the install command to limit the install to a project. A project copy shadows an enabled user copy of the same plugin.

## Use it

Ask omp to use the `review-evidence` skill and provide the revision range or files, expected behavior, and checks it may run. Example task input:

```text
Use review-evidence to review HEAD~1..HEAD.
Requirement: an expired session redirects to sign-in without losing the return URL.
Scope: auth middleware and its callers. Do not modify files.
You may run the existing auth unit tests, but not network or production checks.
Report blockers with file and line references; list checks you did not run.
```

The skill asks omp to inspect actual changes and affected callers, separate observations from inferences, prioritize actionable failures, and report missing evidence honestly. Repository access, a meaningful change range, and the relevant requirements are needed. Tests only run when your task authorizes them and the environment supports them.

## Expected result

A scope summary, prioritized findings containing evidence and impact, a check ledger, and remaining uncertainties. A clean report means no supported findings in the reviewed scope; it is not a guarantee of correctness.

## Update and reload

```text
/marketplace update omp-bazaar
/marketplace upgrade review-evidence@omp-bazaar
/reload-plugins
```

Updating the marketplace refreshes the catalog only. Upgrading replaces an installed plugin. These skills become available after `/reload-plugins` in the TUI; a new session also loads them. Newly installed non-MCP tools, hooks, or extension modules would require restarting the session; this plugin contains none of those. If installed in both scopes, choose `--scope user` or `--scope project` when upgrading in the TUI.

## Source and license

[Read the complete skill](https://github.com/suj1e/omp-bazaar/blob/main/plugins/review-evidence/skills/review-evidence/SKILL.md). Maintained by suj1e under the [MIT license](https://github.com/suj1e/omp-bazaar/blob/main/LICENSE).
