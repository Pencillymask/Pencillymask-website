import { csvRowSchema, CsvRowData } from '../lib/validation';
import { artworkService } from './artworkService';

export interface CsvImportRowResult {
  rowNumber: number;
  data: Partial<CsvRowData>;
  isValid: boolean;
  errors: string[];
}

export interface CsvImportSummary {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rowResults: CsvImportRowResult[];
}

export const csvImportService = {
  // Simple CSV text parser supporting quoted values
  parseCsvText(csvContent: string): { headers: string[]; rows: string[][] } {
    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows = lines.slice(1).map(parseLine).filter(r => r.length > 1 || r[0] !== '');

    return { headers, rows };
  },

  // Validate CSV against expected schema
  validateCsv(csvContent: string): CsvImportSummary {
    const { headers, rows } = this.parseCsvText(csvContent);
    const rowResults: CsvImportRowResult[] = [];

    // Header validation check
    const requiredHeaders = ['title', 'price', 'medium', 'width', 'height', 'year', 'category'];
    const missingHeaders = requiredHeaders.filter(req => !headers.includes(req));

    if (missingHeaders.length > 0) {
      return {
        totalRows: 0,
        validCount: 0,
        invalidCount: 0,
        rowResults: [
          {
            rowNumber: 0,
            data: {},
            isValid: false,
            errors: [`Missing required CSV column headers: ${missingHeaders.join(', ')}`],
          }
        ],
      };
    }

    const titleIndex = headers.indexOf('title');
    const priceIndex = headers.indexOf('price');
    const mediumIndex = headers.indexOf('medium');
    const widthIndex = headers.indexOf('width');
    const heightIndex = headers.indexOf('height');
    const yearIndex = headers.indexOf('year');
    const categoryIndex = headers.indexOf('category');
    const statusIndex = headers.indexOf('status');
    const descriptionIndex = headers.indexOf('description');

    let validCount = 0;
    let invalidCount = 0;

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // header is line 1
      const rawData = {
        title: row[titleIndex] || '',
        price: row[priceIndex] || '',
        medium: row[mediumIndex] || '',
        width: row[widthIndex] || '',
        height: row[heightIndex] || '',
        year: row[yearIndex] || '',
        category: row[categoryIndex] || '',
        status: row[statusIndex] || 'available',
        description: row[descriptionIndex] || '',
      };

      const errors: string[] = [];

      // Validate with Zod
      const parseResult = csvRowSchema.safeParse(rawData);
      if (!parseResult.success) {
        parseResult.error.errors.forEach(err => {
          errors.push(`${err.path.join('.')}: ${err.message}`);
        });
      }

      const isValid = errors.length === 0;
      if (isValid) validCount++;
      else invalidCount++;

      rowResults.push({
        rowNumber: rowNum,
        data: {
          title: String(rawData.title),
          price: Number(rawData.price) || 0,
          medium: String(rawData.medium),
          width: Number(rawData.width) || 0,
          height: Number(rawData.height) || 0,
          year: Number(rawData.year) || 2025,
          category: String(rawData.category),
          status: (rawData.status as any) || 'available',
          description: String(rawData.description),
        },
        isValid,
        errors,
      });
    });

    return {
      totalRows: rows.length,
      validCount,
      invalidCount,
      rowResults,
    };
  },

  // Batch import valid rows into artwork storage
  commitValidRows(validResults: CsvImportRowResult[]) {
    let importedCount = 0;
    const allCategories = artworkService.getCategories();
    validResults.forEach(res => {
      if (res.isValid && res.data) {
        const catStr = (res.data.category || '').toLowerCase().trim();
        const matchedCategory = allCategories.find(c =>
          c.slug.toLowerCase() === catStr ||
          c.name.toLowerCase() === catStr ||
          c.id === res.data.category
        );

        artworkService.saveArtwork({
          title: res.data.title,
          price: Number(res.data.price),
          medium: res.data.medium,
          width: Number(res.data.width),
          height: Number(res.data.height),
          year: Number(res.data.year),
          categoryId: matchedCategory ? matchedCategory.id : undefined,
          categoryName: matchedCategory?.name,
          categorySlug: matchedCategory?.slug,
          description: res.data.description || `Original painting ${res.data.title} by Dhruvi.`,
          status: (res.data.status as any) || 'available',
        });
        importedCount++;
      }
    });
    return importedCount;
  }
};
