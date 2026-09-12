// Returns handling for OrderDesk.
//
// A return covers one or more lines of an order. A refund against it must be
// approved by a refunds clerk before any money moves.
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function filterReturnableLines(lines) {
  const returnableLines = lines.filter((line) => !line.finalClearance);

  if (returnableLines.length === 0) {
    throw new Error('cannot open a return: all lines are final clearance');
  }

  return returnableLines;
}

/**
 * Open a return request against an order.
 *
 * @param {object} order  the order being returned against
 * @param {Array}  lines  the order lines the customer is sending back
 * @returns {object} the new return request
 */
function openReturn(order, lines, now = new Date()) {
  if (lines.length === 0) {
    throw new Error('a return must cover at least one line');
  }

  // Keep both policies: clearance controls eligible lines, while the
  // delivery window controls whether the return can still be opened.
  const returnableLines = filterReturnableLines(lines);

  if (order.deliveredAt) {
    const deliveredAt = new Date(order.deliveredAt);
    const diffMs = now - deliveredAt;
    const diffDays = diffMs / MS_PER_DAY;

    if (diffDays > 30) {
      throw new Error(
        'return refused: outside the 30-day return window'
      );
    }
  }

  return {
    orderId: order.id,
    lines: returnableLines,
    raisedAt: now.toISOString(),
    approvedBy: null,
    approvedAt: null,
  };
}

function approve(returnRequest, clerkId, reason) {
  if (!reason) {
    throw new Error('a refund approval must carry a reason');
  }

  return {
    ...returnRequest,
    approvedBy: clerkId,
    approvedAt: new Date().toISOString(),
    reason,
  };
}

module.exports = { openReturn, approve };