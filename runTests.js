// runTests.js

const newman = require('newman');
const fs     = require('fs');
const path   = require('path');

const collection  = require('./project/collections/API_collection.json');
const environment = require('./project/environments/dev.env.json');
const data        = require('./project/data/testData.json');

// Ensure reports directory exists — created automatically on first run
// so cloned repositories work without manual setup.
const reportsDir = path.resolve(__dirname, 'project/reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function setCollectionVariable(key, value) {
  if (!Array.isArray(collection.variable)) collection.variable = [];
  const existing = collection.variable.find(v => v.key === key);
  if (existing) {
    existing.value = value;
  } else {
    collection.variable.push({ key, value });
  }
}

function loadSchemasFromDirectory() {
  const schemasDir = path.resolve(__dirname, 'project/schemas');
  if (!fs.existsSync(schemasDir)) return {};

  const schemaStore = {};
  const files = fs.readdirSync(schemasDir).filter((file) => file.endsWith('.json'));

  files.forEach((file) => {
    const key = path.basename(file, '.json');
    const absolutePath = path.join(schemasDir, file);
    const raw = fs.readFileSync(absolutePath, 'utf8').trim();
    if (!raw) return;

    try {
      schemaStore[key] = JSON.parse(raw);
    } catch (err) {
      console.warn(`Skipping invalid schema file: ${file} (${err.message})`);
    }
  });

  return schemaStore;
}

const schemaStore = loadSchemasFromDirectory();
setCollectionVariable('schema_store', JSON.stringify(schemaStore));

console.log("Starting Newman...");

newman.run({
  collection,
  environment,
  iterationData: data,
  delayRequest: 1000,

  reporters: ['cli', 'htmlextra'],

  reporter: {
    htmlextra: {
      export: './project/reports/report.html',
      open: true,
      title: 'API Testing Report'
    }
  }

}, function (err, summary) {

  if (err) {
    console.error("❌ Run failed:", err);
    process.exit(1);
  }

  console.log("Run finished");

  summary.run.executions.forEach(exec => {
    exec.assertions.forEach(assertion => {
      const status = assertion.error ? '❌ FAIL' : '✅ PASS';
      console.log(`${assertion.assertion} → ${status}`);
    });
  });

});