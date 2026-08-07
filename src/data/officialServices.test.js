import { describe, expect, it } from 'vitest';
import { getOfficialService, officialServiceCounts, officialServices } from './officialServices';

describe('official BTEA service catalog', () => {
  it('preserves every publicly observed service surface', () => {
    expect(officialServices).toHaveLength(19);
    expect(officialServiceCounts.properties).toBe(14);
    expect(officialServiceCounts.individuals).toBe(4);
    expect(officialServiceCounts.public).toBe(1);
  });

  it('keeps source attribution and usable workflow metadata', () => {
    for (const service of officialServices) {
      expect(service.sourceUrl).toMatch(/^https:\/\/portal\.btea\.bh\//);
      expect(service.summary.length).toBeGreaterThan(20);
      expect(service.documents.length).toBeGreaterThan(0);
      expect(service.steps.length).toBeGreaterThan(0);
    }
    expect(getOfficialService('2').fees).toContain('mandatory');
    expect(getOfficialService('complaints').audience).toBe('public');
  });
});
