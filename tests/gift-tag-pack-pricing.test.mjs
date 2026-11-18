import test from 'node:test';
import assert from 'node:assert/strict';
import { applyGiftTagPackPricing, giftTagPackSavings } from '../lib/giftTagPackPricing.ts';

test('mix-and-match pricing preserves designs, other items and the exact stored payment total', () => {
  const tag = { productType: 'product', productSlug: 'memory-tag', unitPricePence: 799 };
  const items = [
    { ...tag, design: 'birthday', quantity: 5 },
    { ...tag, design: 'wedding', quantity: 1 },
    { ...tag, design: 'christmas', quantity: 1 },
    { productType: 'bundle', productSlug: 'memory-tag', unitPricePence: 2000, quantity: 1, design: 'bundle' },
  ];
  const total = (lines) => lines.reduce((sum, line) => sum + line.unitPricePence * line.quantity, 0);
  const priced = applyGiftTagPackPricing(items);
  assert.equal(giftTagPackSavings(items), 796);
  assert.equal(total(priced), 2 * 1999 + 799 + 2000);
  assert.equal(total(items) - total(priced), giftTagPackSavings(items));
  for (const item of items) {
    assert.equal(priced.filter(line => line.design === item.design).reduce((sum, line) => sum + line.quantity, 0), item.quantity);
  }
  assert.deepEqual(applyGiftTagPackPricing([{ ...tag, quantity: 2 }]), [{ ...tag, quantity: 2 }]);
});
