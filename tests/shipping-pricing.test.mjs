import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  digitalOnlyCart,
  singleMemoryTagLetterCart,
  getCartShippingPricePence,
} from '../lib/shippingPricing.ts';

const tag = { productType: 'product', productSlug: 'memory-tag', quantity: 1 };
const digital = { productType: 'product', productSlug: 'digital-memory', quantity: 1 };
const mug = { productType: 'product', productSlug: 'photo-mug', quantity: 1 };

test('a single physical memory tag qualifies for cautious Large Letter postage', () => {
  assert.equal(singleMemoryTagLetterCart([tag]), true);
  assert.equal(getCartShippingPricePence([tag], 'standard'), 155);
  assert.equal(getCartShippingPricePence([tag], 'express'), 320);
});

test('digital-only orders never pay postage', () => {
  assert.equal(digitalOnlyCart([digital]), true);
  assert.equal(getCartShippingPricePence([digital], 'standard'), 0);
  assert.equal(getCartShippingPricePence([digital], 'express'), 0);
  assert.equal(getCartShippingPricePence([digital, digital], 'standard'), 0);
});

test('two tags or mixed physical orders use standard parcel shipping until packed size is verified', () => {
  assert.equal(singleMemoryTagLetterCart([{ ...tag, quantity: 2 }]), false);
  assert.equal(getCartShippingPricePence([{ ...tag, quantity: 2 }], 'standard'), 395);
  assert.equal(getCartShippingPricePence([tag, mug], 'standard'), 395);
  assert.equal(getCartShippingPricePence([tag, digital], 'standard'), 395);
  assert.equal(getCartShippingPricePence([mug], 'express'), 695);
});

test('item names and client-supplied prices cannot force lower delivery tiers', () => {
  assert.equal(singleMemoryTagLetterCart([{
    productType: 'bundle', productSlug: 'memory-tag', quantity: 1
  }]), false);
  assert.equal(getCartShippingPricePence([{
    productType: 'bundle', productSlug: 'memory-tag', quantity: 1
  }], 'standard'), 395);
  assert.equal(getCartShippingPricePence([], 'standard'), 395);
});
