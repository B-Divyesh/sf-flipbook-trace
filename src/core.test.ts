import { describe, expect, test } from 'vitest';
import { defaultSettings, normalizeSettings } from './core';

describe('normalizeSettings', () => {
  const imported = { fps: 12, threshold: 180, mode: 'gray', onion: true, quality: 1920, columns: 6 };

  test('restores every valid setting for Studio', () => {
    expect(normalizeSettings(imported, true)).toEqual(imported);
  });

  test('keeps free export limits when imported settings request Studio', () => {
    expect(normalizeSettings(imported, false)).toEqual({ ...imported, quality: 960, columns: 4 });
  });

  test('rejects malformed settings instead of storing them', () => {
    expect(() => normalizeSettings({ ...defaultSettings, fps: 7 }, false)).toThrow('Invalid frame rate');
    expect(() => normalizeSettings({ ...defaultSettings, threshold: 900 }, false)).toThrow('Invalid threshold');
  });
});
