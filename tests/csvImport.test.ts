import { describe, it, expect } from 'vitest';
import { csvImportService } from '../src/services/csvImportService';

describe('CSV Bulk Import Validation Service', () => {
  it('should pass valid CSV row data', () => {
    const validCsv = `title,price,medium,width,height,year,category,status,description
"Whispers in Gold",125000,"Oil on Canvas",36,48,2025,"Oil on Canvas","available","Sample original painting"`;

    const summary = csvImportService.validateCsv(validCsv);
    expect(summary.totalRows).toBe(1);
    expect(summary.validCount).toBe(1);
    expect(summary.invalidCount).toBe(0);
  });

  it('should detect invalid negative price or missing title', () => {
    const invalidCsv = `title,price,medium,width,height,year,category,status,description
"",-500,"Oil on Canvas",36,48,2025,"Oil on Canvas","available","Sample invalid painting"`;

    const summary = csvImportService.validateCsv(invalidCsv);
    expect(summary.totalRows).toBe(1);
    expect(summary.validCount).toBe(0);
    expect(summary.invalidCount).toBe(1);
    expect(summary.rowResults[0].errors.length).toBeGreaterThan(0);
  });
});
