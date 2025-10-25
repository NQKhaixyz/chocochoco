#!/usr/bin/env node
// Usage: node scripts/print-latest-deploy.mjs <run-latest.json> <explorer_base_url>
import fs from 'node:fs';
import path from 'node:path';

const [,, jsonPathArg, explorerBase] = process.argv;
if (!jsonPathArg || !explorerBase) {
  console.error('Usage: node scripts/print-latest-deploy.mjs <run-latest.json> <explorer_base_url>');
  process.exit(1);
}

const jsonPath = path.resolve(jsonPathArg);
if (!fs.existsSync(jsonPath)) {
  console.error(`Not found: ${jsonPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

const tx = (data.transactions || []).find(t => t.contractAddress) || data.transactions?.[0];
const rc = (data.receipts || []).find(r => r.contractAddress) || data.receipts?.[0];

const address = (tx && tx.contractAddress) || (rc && rc.contractAddress);
const blockNumber = rc?.blockNumber ?? tx?.blockNumber ?? null;
const chainId = data.chainId || data.chain || path.basename(path.dirname(jsonPath));

if (!address) {
  console.error('Could not find contractAddress in broadcast JSON');
  process.exit(1);
}

const verifyUrl = `${explorerBase}/${address}#code`;

console.log('Deployment summary');
console.log('- chainId:', chainId);
console.log('- address:', address);
console.log('- block  :', blockNumber);
console.log('- verify :', verifyUrl);

// Persist to contracts/deployments.json (append/update per chainId)
const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const deploymentsPath = path.join(repoRoot, 'contracts', 'deployments.json');

let deployments = {};
if (fs.existsSync(deploymentsPath)) {
  try { deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8')); } catch {}
}

deployments[String(chainId)] = {
  address,
  blockNumber,
  verifyUrl,
  updatedAt: new Date().toISOString()
};

fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
console.log(`Saved summary -> ${path.relative(repoRoot, deploymentsPath)}`);

