const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// Path to Python audit scripts folder
const ENGINE_PATH = process.env.PYTHON_ENGINE_PATH || '../audit-engine/';

// List of audit scripts
const AUDIT_MODULES = [
  'audit_schema.py',
  'audit_indexes.py',
  'audit_constraints.py',
  'audit_query_perf.py',
  'audit_privileges.py',
  'audit_data_quality.py',
  'audit_normalization.py'
];


/**
 * Run a Python script and return its parsed JSON output.
 */
function runAuditModule(scriptName, envVars) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(ENGINE_PATH, scriptName);
    const proc = spawn('python3', [scriptPath], { env: { ...process.env, ...envVars } });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => (output += data.toString()));
    proc.stderr.on('data', (data) => (errorOutput += data.toString()));

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve({ module: scriptName, result });
        } catch (err) {
          reject({ script: scriptName, error: 'Malformed JSON output' });
        }
      } else {
        reject({ script: scriptName, error: errorOutput || `Script exited with code ${code}` });
      }
    });
  });
}

// POST /audit → launch all 3 modules
router.post('/', verifyToken, async (req, res) => {
  const { host, port, user, password, database } = req.body;

// Extra defensive check to ensure fields are not missing (even if empty string)
const requiredFields = { host, port, user, password, database };

for (const [key, value] of Object.entries(requiredFields)) {
  if (value === undefined) {
    console.log(`Missing field: ${key}`);
    return res.status(400).json({ message: `Field '${key}' is required.` });
  }
}

  const envVars = {
    DB_HOST: host,
    DB_PORT: port.toString(),
    DB_USER: user,
    DB_PASS: password,
    DB_NAME: database
  };

  const results = {};
  const failedModules = [];

  // Run all modules sequentially (or you could do Promise.all for parallel)
  for (const module of AUDIT_MODULES) {
    try {
      const { result } = await runAuditModule(module, envVars);
      const key = result.module; // "schema", "indexes", or "constraints"
      results[key] = result;
    } catch (err) {
      console.error(`Audit module failed: ${module}`, err);
      failedModules.push(module.replace('.py', ''));
    }
  }

  // Determine response code
  if (failedModules.length === 0) {
    return res.status(200).json(results);
  } else if (failedModules.length < AUDIT_MODULES.length) {
    return res.status(207).json({
      ...results,
      failed: failedModules,
      message: 'Some modules failed to run.'
    });
  } else {
    return res.status(500).json({
      message: 'All audit modules failed. Check database access or script configuration.',
      failed: failedModules
    });
  }
});

module.exports = router;
