---
name: release-readiness
description: Assess a specified release against acceptance criteria and available evidence, producing blockers plus rollout and rollback plans without deploying. Use for release readiness and handoff decisions.
---

# Release readiness

## Define the release

Read applicable repository instructions and release documentation. Identify the exact revision or artifact, target environment, release owner, scope of changes, and acceptance criteria. Record what actions the task allows. Planning is not permission to deploy, mutate infrastructure, publish a package, access production, or run a destructive check.

Resolve facts from repository files and supplied CI results before asking the user. Do not invent an owner, deployment topology, rollback mechanism, or service-level objective. Missing release identity or mandatory acceptance criteria must appear as a blocker to a complete recommendation.

## Map acceptance to evidence

For every criterion, identify the changed implementation, affected callers or consumers, and the strongest available supporting evidence. Record one of: observed pass, observed fail, unknown, or not applicable with a reason. Existing test names and green results for a different revision do not prove this revision passed. Record revision, environment, command or source, timestamp when available, and actual result.

Accept user-reported results as evidence; do not rerun a reported failure just to confirm it. Separate an inference from an exercised result. A missing environment, credential, browser, device, dependency, or external service is an explicit verification limit, never an implicit pass.

## Examine release-specific risks

Read the actual change and relevant release configuration. Select risks that apply: data migrations and reversibility, API or persisted-data compatibility, configuration and secret requirements, dependencies, asset URLs, permission changes, and affected user journeys. Follow breaking interfaces to consumers. Distinguish release regressions from unrelated existing issues.

Do not run arbitrary installation hooks or newly discovered plugin code to validate readiness. Only execute checks explicitly authorized by the task. Use existing project commands where available and preserve exact outputs or references. Do not create a second testing convention merely for this assessment.

## Form a practical rollout plan

Use the real deployment mechanism documented by the project. State the target revision/artifact, authorized operator, preconditions, deployment steps, immediate smoke checks, observable success criteria, and stop conditions. A generic command is not a project-specific plan; inspect the actual scripts or documentation before naming it.

Describe rollback using a known previous artifact and documented mechanism. If migrations are irreversible or previous artifacts unavailable, state that rollback is unproven and describe the decision that must be made before shipping. Do not promise zero downtime or automatic recovery without evidence. Keep planned checks distinct from checks already run.

## Give a decision, not false certainty

Return:

1. Release identity and scope.
2. Acceptance ledger: criterion, evidence reference, status, and remaining gap.
3. Blockers and accepted risks, with the responsible owner only when known.
4. Rollout and rollback plans grounded in the actual target.
5. Recommendation and the exact conditions that would change it.

Recommend no-go when a mandatory criterion has failed or remains unknown, unless the authorized owner has explicitly accepted that specific risk. Record that acceptance; do not grant it yourself. A conditional recommendation must name its unmet conditions and is not authorization to deploy. A go recommendation means the stated criteria are supported by the available evidence for the identified revision, not a guarantee against every incident.

Never deploy or publish as part of this skill unless a separate explicit instruction authorizes the action. Handoff should let the release owner act without confusing completed verification with future work.
