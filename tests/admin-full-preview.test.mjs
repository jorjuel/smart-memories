import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('owner login opens full website homepage after verified sign-in', () => {
  const login = readFileSync(new URL('../app/admin/login/actions.ts', import.meta.url), 'utf8');
  assert.match(login, /signInWithPassword/);
  assert.match(login, /allowedEmails\.includes/);
  assert.match(login, /redirect\('\/'\)/);
});

test('owner dashboard has direct navigation back to full website', () => {
  const layout = readFileSync(new URL('../app/admin/(protected)/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /href="\/"[^>]*>[\s\S]*?View Full Website/);
  assert.match(layout, /href="\/admin"/);
});

test('proxy continues to show full app to verified owner, construction page to visitors', () => {
  const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');
  assert.match(proxy, /admin\.auth\.getUser\(\)/);
  assert.match(proxy, /if \(!allowedOwner\) return maintenanceResponse\(request\)/);
  assert.match(proxy, /NextResponse\.next\(\{ request \}\)/);
});
