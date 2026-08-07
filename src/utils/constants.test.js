import { describe, expect, it } from 'vitest';
import { MANAGEMENT_TYPE_LABELS, OUTLET_TYPE_LABELS, OUTLET_TYPES } from './constants';

describe('outlet constants', () => {
  it('provides a user-facing label for every outlet type', () => {
    for (const value of Object.values(OUTLET_TYPES)) {
      expect(OUTLET_TYPE_LABELS[value]).toBeTypeOf('string');
      expect(OUTLET_TYPE_LABELS[value].length).toBeGreaterThan(0);
    }
  });

  it('provides labels for both management modes', () => {
    expect(Object.keys(MANAGEMENT_TYPE_LABELS)).toHaveLength(2);
  });
});
