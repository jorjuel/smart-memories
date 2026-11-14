import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  isMaintenanceActive,
  isMaintenancePublicRoute,
  isMaintenanceOwner,
} from '../lib/siteMaintenance.ts';

test('maintenance is enabled by default and only false disables it', () => {
  assert.equal(isMaintenanceActive(undefined), true);
  assert.equal(isMaintenanceActive('true'), true);
  assert.equal(isMaintenanceActive('false'), false);
  assert.equal(isMaintenanceActive(' FALSE '), false);
  assert.equal(isMaintenanceActive(''), true);
});

test('only existing owner authentication routes and the POST Stripe webhook are public', () => {
  for (const path of [
    '/admin/login',
    '/admin/forgot-password',
    '/admin/auth/callback',
    '/admin/update-password',
  ]) {
    assert.equal(isMaintenancePublicRoute(path, 'GET'), true, path);
    assert.equal(isMaintenancePublicRoute(path, 'POST'), true, path);
  }

  assert.equal(isMaintenancePublicRoute('/api/stripe/webhook', 'POST'), true);
  assert.equal(isMaintenancePublicRoute('/api/stripe/webhook', 'GET'), false);
  for (const path of ['/', '/shop', '/admin', '/api/memories', '/m/ABCDEF', '/api/stripe/create-checkout-session']) {
    assert.equal(isMaintenancePublicRoute(path, 'GET'), false, path);
    assert.equal(isMaintenancePublicRoute(path, 'POST'), false, path);
  }
});

test('owner email must exactly match configured verified user email', () => {
  assert.equal(isMaintenanceOwner(undefined, 'owner@example.com'), false);
  assert.equal(isMaintenanceOwner('owner@example.com', undefined), false);
  assert.equal(isMaintenanceOwner('other@example.com', 'owner@example.com'), false);
  assert.equal(isMaintenanceOwner('OWNer@example.com', ' owner@example.com '), true);
  assert.equal(isMaintenanceOwner('owner@example.com.attacker.invalid', 'owner@example.com'), false);
  assert.equal(isMaintenanceOwner('owner@example.com', 'someone@example.com,owner@example.com'), true);
});

test('construction page includes the requested message without unpublished site content', () => {
  const file = readFileSync(new URL('../lib/maintenancePage.ts', import.meta.url), 'utf8');
  assert.match(file, /Website <em>under construction<\/em>/);
  assert.match(file, /currently under development/);
  assert.match(file, /href="\/admin\/login"/);
  assert.doesNotMatch(file, /\/shop|\/create|\/m\/sample/);
});

test('proxy gates all pages and APIs by verified Supabase admin identity', () => {
  const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');
  assert.match(proxy, /admin\.auth\.getUser\(\)/);
  assert.match(proxy, /cookieOptions: \{ name: 'smart-memories-admin-auth' \}/);
  assert.match(proxy, /if \(!allowedOwner\) return maintenanceResponse\(request\)/);
  assert.match(proxy, /status: 503/);
});
