const assert = require('assert');
const { openReturn } = require('./returns');

const order = { id: 'ORD-1' };

// Case 1: every line is final clearance → must throw
assert.throws(
  () => openReturn(order, [{ sku: 'A', finalClearance: true }]),
  /final clearance/,
  'expected openReturn to refuse when every line is final clearance'
);

// Case 2: mixed lines → succeeds, keeps only normal lines
const result = openReturn(order, [
  { sku: 'A', finalClearance: true },
  { sku: 'B', finalClearance: false },
]);
assert.strictEqual(result.lines.length, 1, 'expected only the normal line to survive');
assert.strictEqual(result.lines[0].sku, 'B', 'expected the surviving line to be sku B');

// Case 3: no final-clearance lines → behaves exactly as before
const normalResult = openReturn(order, [{ sku: 'C', finalClearance: false }]);
assert.strictEqual(normalResult.lines.length, 1, 'expected the normal line to remain untouched');

console.log('All returns.test.js checks passed');