'use strict';

/**
 * CT-30: fall back to contract IDs written by contracts/scripts/deploy.sh
 * (deployments/<network>.json) when the corresponding env vars are absent.
 */

const fs = require('fs');
const path = require('path');

// Maps deployments/<network>.json `contract` names to backend env vars.
const CONTRACT_ENV_MAP = {
  escrow: 'SOROBAN_ESCROW_CONTRACT_ID',
  'creator-earnings': 'SOROBAN_CREATOR_EARNINGS_CONTRACT_ID',
  'reward-token': 'REWARD_TOKEN_CONTRACT_ID',
};

function loadDeployments(network, dir = process.env.DEPLOYMENTS_DIR || path.resolve(__dirname, '../../../deployments')) {
  try {
    const entries = JSON.parse(fs.readFileSync(path.join(dir, `${network}.json`), 'utf8'));
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

/** Fill missing contract-ID env vars from the deployment registry. Env vars always win. */
function applyDeploymentFallback(env = process.env, dir) {
  const network = env.STELLAR_NETWORK || 'testnet';
  for (const { contract, id } of loadDeployments(network, dir)) {
    const key = CONTRACT_ENV_MAP[contract];
    if (key && id && !env[key]) env[key] = id;
  }
  return env;
}

module.exports = { applyDeploymentFallback, loadDeployments, CONTRACT_ENV_MAP };
