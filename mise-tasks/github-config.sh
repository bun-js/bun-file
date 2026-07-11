#!/usr/bin/env bash
set -euo pipefail

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

gh api --method PATCH "repos/$repo" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true \
  -f squash_merge_commit_title=PR_TITLE

gh api --method PUT "repos/$repo/actions/permissions/workflow" \
  -f default_workflow_permissions=write \
  -F can_approve_pull_request_reviews=true

# Require the pull-request CI workflow to pass before merging into main.
gh api --method PUT "repos/$repo/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Check"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON
