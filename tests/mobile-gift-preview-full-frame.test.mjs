import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

const form = readFileSync(new URL('../components/ProductPersonaliser.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

test('only the selected design preview appears on the design step on phones', () => {
  assert.match(form, /currentStep !== 'preview' && currentStep !== 'ready' && currentStep !== 'gift' && \(/);
  assert.match(form, /className="smDesignPickerArtwork"/);
  assert.match(form, /template=\{template\}/);
  assert.match(css, /\.smWizardPage \.smDesignPickerResult \{\s*display: flex;\s*flex-direction: column;/);
  assert.match(css, /\.smWizardPage \.smDesignPickerArtwork,\s*\.smWizardPage \.smWizardPhonePreviewArtwork,\s*\.smFullGiftPreviewArtwork \{[\s\S]*?height: auto;/);
});

test('a photo slate keeps portrait or landscape aspect ratio and no 105px crop', () => {
  assert.match(css, /\.configuredPreview:is\(\.slateConfigured,\.plaqueConfigured,\.mouseConfigured,\.genericConfigured\) \{\s*aspect-ratio: 4 \/ 5;/);
  assert.match(css, /\.configuredPreview\.configuredLandscape[\s\S]*?aspect-ratio: 5 \/ 4;/);
  assert.match(css, /\.smWizardPage \.smDesignPickerArtwork > \.configuredPreview \{\s*max-width: min\(100%, 295px\) !important;\s*height: auto !important;/);
  assert.match(css, /\.smFullGiftPreviewArtwork \.configuredPreviewImage \{[\s\S]*?object-fit: contain !important;/);
});

test('phone preview and Continue controls do not float over the editor', () => {
  assert.match(css, /\.smWizardPage \.smWizardPhoneLivePreview \{\s*position: static;/);
  assert.match(css, /\.smWizardPage \.smWizardNavigation \{\s*position: static;/);
});

test('a full preview is available through native accessible dialog', () => {
  assert.match(form, /useRef<HTMLDialogElement>\(null\)/);
  assert.match(form, /fullGiftPreviewDialogRef\.current\?\.showModal\(\)/);
  assert.match(form, /fullGiftPreviewDialogRef\.current\?\.close\(\)/);
  assert.match(form, /<dialog ref=\{fullGiftPreviewDialogRef\}/);
  assert.match(form, /aria-label="Full-size preview of your personalised gift"/);
  assert.match(css, /\.smFullGiftPreviewDialog::backdrop \{/);
});
