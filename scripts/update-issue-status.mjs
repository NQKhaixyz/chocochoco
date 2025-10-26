#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

// Usage: node scripts/update-issue-status.mjs <in-progress|done> [issuePath]
// Defaults to docs/issues/005-S1.5-fe-project-setup.md

const STATUS = process.argv[2]
const ISSUE_PATH_ARG = process.argv[3]
const ISSUE_PATH = ISSUE_PATH_ARG || path.join('docs', 'issues', '005-S1.5-fe-project-setup.md')

if (!STATUS || !['in-progress', 'done'].includes(STATUS)) {
  console.error('Usage: node scripts/update-issue-status.mjs <in-progress|done> [issuePath]')
  process.exit(1)
}

if (!fs.existsSync(ISSUE_PATH)) {
  console.error(`Issue file not found: ${ISSUE_PATH}`)
  process.exit(1)
}

const src = fs.readFileSync(ISSUE_PATH, 'utf8')
const fmMatch = src.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/)
if (!fmMatch) {
  console.error('Front-matter not found.')
  process.exit(1)
}

const fm = fmMatch[1]
let updatedFm = ''
if (/^status:\s*"?[^"]+"?/im.test(fm)) {
  updatedFm = fm.replace(/^status:\s*"?[^"]+"?/im, `status: "${STATUS}"`)
} else {
  updatedFm = fm + `\nstatus: "${STATUS}"\n`
}
const out = src.replace(fmMatch[0], `---\n${updatedFm}\n---`)
fs.writeFileSync(ISSUE_PATH, out, 'utf8')
console.log(`✅ Updated ${ISSUE_PATH} status → ${STATUS}`)

