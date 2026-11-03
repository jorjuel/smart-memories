import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verifiedGuestOrderEmail } from '../lib/customerOrderAccess.ts';
import { customerOrderProgress } from '../lib/customerOrderProgress.ts';

test('unconfirmed users never unlock guest orders', () => {
  assert.equal(verifiedGuestOrderEmail({
    email: 'customer@example.com',
    email_confirmed_at: null,
  }), null);
  assert.equal(verifiedGuestOrderEmail({
    email: 'customer@example.com',
  }), null);
});

test('verified guest email is trimmed and normalised', () => {
  assert.equal(verifiedGuestOrderEmail({
    email: '  CUSTOMER@Example.com  ',
    email_confirmed_at: '2026-11-03T20:00:00Z',
  }), 'customer@example.com');
  assert.equal(verifiedGuestOrderEmail({
    email: ' ',
    email_confirmed_at: '2026-11-03T20:00:00Z',
  }), null);
});

test('unpaid, failed and refunded orders never appear in production', () => {
  assert.equal(customerOrderProgress('pending', 'in_production'), 'Awaiting Payment');
  assert.equal(customerOrderProgress('failed', 'dispatched'), 'Payment Failed');
  assert.equal(customerOrderProgress('refunded', 'ready_to_dispatch'), 'Payment Refunded');
});

test('paid orders show genuine production stages', () => {
  assert.equal(customerOrderProgress('paid', 'new'), 'Order Confirmed');
  assert.equal(customerOrderProgress('paid', 'content_check'), 'Checking Your Memory');
  assert.equal(customerOrderProgress('paid', 'in_production'), 'Making Your Gift');
  assert.equal(customerOrderProgress('paid', 'nfc_programming'), 'Connecting Your Memory');
  assert.equal(customerOrderProgress('paid', 'ready_to_dispatch'), 'Ready to Dispatch');
  assert.equal(customerOrderProgress('paid', 'dispatched'), 'Dispatched');
  assert.equal(customerOrderProgress('paid', 'on_hold'), 'Order Under Review');
});
