#!/usr/bin/env bash
set -euo pipefail

# Create a PR to https://github.com/NQKhaixyz/chocochoco using gh CLI and the content from this repo's chocochoco/ folder.
# Requirements:
# - gh (GitHub CLI) authenticated: gh auth login (or GH_TOKEN env)
# - git, rsync
# - network access
#
# Usage:
#   ./scripts/create_chocochoco_pr.sh [branch-name]
#
# Notes:
# - Script clones the target repo into a temp dir, creates a branch, copies over files from ./chocochoco,
#   commits, pushes, and opens a PR against base=main by default.

TARGET_REPO="NQKhaixyz/chocochoco"
BASE_BRANCH="main"
BRANCH_NAME="${1:-feat/chocochoco-commit-reveal-mvp}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo "Cloning $TARGET_REPO into $TEMP_DIR/repo ..."
GH_TOKEN_CHECK=$(gh auth status >/dev/null 2>&1 && echo OK || echo NO)
if [[ "$GH_TOKEN_CHECK" != "OK" ]]; then
  echo "[!] gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

git clone "https://github.com/${TARGET_REPO}.git" "$TEMP_DIR/repo"
cd "$TEMP_DIR/repo"

# Detect default branch if possible
if git ls-remote --heads origin "$BASE_BRANCH" >/dev/null 2>&1; then
  echo "Using base branch: $BASE_BRANCH"
else
  # try 'master'
  if git ls-remote --heads origin master >/dev/null 2>&1; then
    BASE_BRANCH="master"
    echo "Using base branch: $BASE_BRANCH"
  else
    echo "[!] Could not find base branch 'main' or 'master'. Please pass a base branch manually by editing the script."
  fi
fi

git checkout -b "$BRANCH_NAME" "$BASE_BRANCH" || git checkout -b "$BRANCH_NAME"

# Ensure .github/workflows exists
mkdir -p .github/workflows

# Copy from our workspace
# Copy the entire chocochoco folder content into the root of target repo
rsync -a "$ROOT_DIR/" ./

# Also copy CI workflow from root if exists (relative to our repo root)
if [[ -f "$ROOT_DIR/../.github/workflows/chocochoco-contracts-ci.yml" ]]; then
  mkdir -p .github/workflows
  cp "$ROOT_DIR/../.github/workflows/chocochoco-contracts-ci.yml" .github/workflows/
fi

# PR body template
PR_BODY_FILE="$TEMP_DIR/PR_BODY.md"
cat > "$PR_BODY_FILE" <<'PR'
# ChocoChoco MVP — Commit–Reveal Minority Game

This PR introduces the initial ChocoChoco MVP:

- Docs
  - README (themed)
  - DESIGN.md (detailed design)
  - SPRINT_PLAN.md (sprint planning)
  - docs/issues/ (file-per-issue backlog for S1 & S2)
- Contracts (Foundry)
  - foundry.toml, CI workflow (GitHub Actions)
  - src/ChocoChocoGame.sol — v1 native commit–reveal, tie refund, forfeit off
  - test/ChocoChocoGame.t.sol — TDD suite (forge-std)
  - script/DeployChocoChocoGame.s.sol — minimal deployment script
- CI
  - Foundry toolchain install, matrix (OS/Solc), gas report, coverage (lcov), artifact upload

## Notes
- Fee 3% sent at settle; winners claim distributable; tie refunds.
- Non-revealers refund (forfeit off in v1).
- Pull-payment (claim), no batch payouts.

After merge, run tests locally:

```bash
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
forge test --gas-report
```
PR

# Commit and push

git add .
if git diff --cached --quiet; then
  echo "No changes to commit. Exiting."
  exit 0
fi

git commit -m "chore: add ChocoChoco MVP (contracts, docs, CI)"

echo "Pushing branch..."
if ! git push -u origin "$BRANCH_NAME"; then
  echo "[!] Push to origin failed (likely no permission). Attempting to fork and push via gh..."
  gh repo fork "$TARGET_REPO" --remote=true --clone=false || true
  # gh adds a 'fork' remote pointing to your fork
  if git remote get-url fork >/dev/null 2>&1; then
    git push -u fork "$BRANCH_NAME"
  else
    echo "[!] Fork remote not found. Please push manually (git remote -v)."
    exit 1
  fi
fi

# Create PR
BASE_FLAG=(--base "$BASE_BRANCH")
if ! gh pr create "${BASE_FLAG[@]}" --title "ChocoChoco MVP: contracts, docs, CI" --body-file "$PR_BODY_FILE"; then
  echo "[!] gh pr create failed. You can create the PR manually on GitHub."
fi

echo "Done."
