import { describe, it, expect } from 'vitest';
import { canViewAsset, canEditAssets, isAdmin } from './roles.js';

const asset = (...levels) => ({ _embedded: { 'wp:term': [levels.map((slug) => ({ taxonomy: 'access_level', slug }))] } });

describe('access levels', () => {
  it('admin sees every asset', () => {
    expect(canViewAsset('administrator', asset('Confidential'))).toBe(true);
  });

  it('contributor sees internal but not restricted/confidential', () => {
    expect(canViewAsset('dam_contributor', asset('internal'))).toBe(true);
    expect(canViewAsset('dam_contributor', asset('restricted'))).toBe(false);
    expect(canViewAsset('dam_contributor', asset('public', 'confidential'))).toBe(false);
  });

  it('subscriber and logged-out users only see unrestricted assets', () => {
    for (const role of ['dam_subscriber', '']) {
      expect(canViewAsset(role, asset('public'))).toBe(true);
      expect(canViewAsset(role, asset('internal'))).toBe(false);
    }
    expect(canViewAsset('dam_subscriber', {})).toBe(true);
  });

  it('only admin and contributor can edit; only admin is admin', () => {
    expect(['administrator', 'dam_contributor', 'dam_subscriber', ''].map(canEditAssets)).toEqual([true, true, false, false]);
    expect(isAdmin('administrator')).toBe(true);
    expect(isAdmin('dam_contributor')).toBe(false);
  });
});
