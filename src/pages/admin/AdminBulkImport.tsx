import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, ArrowLeft, CheckCircle, FileText, Check } from 'lucide-react';
import { csvImportService, CsvImportSummary } from '../../services/csvImportService';
import { SEO } from '../../components/layout/SEO';

export const AdminBulkImport: React.FC = () => {
  const [csvText, setCsvText] = useState('');
  const [summary, setSummary] = useState<CsvImportSummary | null>(null);
  const [committed, setCommitted] = useState(false);
  const [committedCount, setCommittedCount] = useState(0);

  const sampleCsvTemplate = `title,price,medium,width,height,year,category,status,description
"Whispers of Solitude",125000,"Oil & 24K Gold Leaf",40,50,2025,"Oil on Canvas","available","Original painting by Dhruvi"
"Azure Horizon No. 2",98000,"Impasto Acrylic",36,36,2025,"Acrylic & Mixed Media","available","Textured coastal sea composition"
"Earthy Textures",85000,"Raw Pigments on Wood",24,30,2024,"Botanical & Earth","sold","Sold to private collection"`;

  const handleValidate = () => {
    if (!csvText.trim()) return;
    const res = csvImportService.validateCsv(csvText);
    setSummary(res);
    setCommitted(false);
  };

  const handleCommit = () => {
    if (!summary) return;
    const count = csvImportService.commitValidRows(summary.rowResults);
    setCommittedCount(count);
    setCommitted(true);
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fadeIn">
      <SEO title="Bulk Import Artworks" noindex={true} />
      
      {/* Header */}
      <div>
        <Link to="/admin/dashboard" className="text-xs text-gallery-muted hover:text-gallery-dark flex items-center gap-1 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl text-gallery-dark font-medium">CSV Bulk Artwork Import</h1>
        <p className="text-xs text-gallery-muted">Batch upload multiple paintings into artwork storage with row-level Zod validation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: CSV Editor & File Drop (6 cols) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gallery-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-gallery-dark font-medium">1. Paste or Upload CSV Data</h3>
            <button
              onClick={() => setCsvText(sampleCsvTemplate)}
              className="text-xs text-gallery-gold hover:underline font-medium"
            >
              Load Sample Template
            </button>
          </div>

          {/* File Drag and Drop box */}
          <label className="block p-4 border-2 border-dashed border-gallery-border hover:border-gallery-gold rounded-lg text-center cursor-pointer bg-gallery-card/30 transition-colors">
            <Upload className="w-6 h-6 text-gallery-gold mx-auto mb-1" />
            <span className="text-xs font-semibold text-gallery-dark block">Click to select CSV File</span>
            <span className="text-[11px] text-gallery-muted">Supports .csv files formatted with headers</span>
            <input type="file" accept=".csv" onChange={handleFileDrop} className="hidden" />
          </label>

          <textarea
            rows={10}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="title,price,medium,width,height,year,category,status,description..."
            className="w-full p-3 font-mono text-xs bg-gallery-bg border border-gallery-border rounded text-gallery-dark focus:outline-none"
          />

          <button
            onClick={handleValidate}
            disabled={!csvText.trim()}
            className="w-full py-3 bg-gallery-dark hover:bg-gallery-gold disabled:opacity-40 text-white font-medium text-xs tracking-wider uppercase rounded transition-colors"
          >
            Validate CSV Rows
          </button>
        </div>

        {/* Right Column: Validation Report & Commit (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {summary ? (
            <div className="bg-white p-6 rounded-xl border border-gallery-border shadow-xs space-y-4">
              <h3 className="font-serif text-lg text-gallery-dark font-medium">2. Row Validation Report</h3>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gallery-card rounded border border-gallery-border">
                  <span className="text-[10px] text-gallery-muted uppercase font-bold">Total Rows</span>
                  <p className="font-serif text-2xl text-gallery-dark font-semibold">{summary.totalRows}</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold">Valid Rows</span>
                  <p className="font-serif text-2xl text-emerald-800 font-semibold">{summary.validCount}</p>
                </div>

                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <span className="text-[10px] text-red-800 uppercase font-bold">Invalid Rows</span>
                  <p className="font-serif text-2xl text-red-800 font-semibold">{summary.invalidCount}</p>
                </div>
              </div>

              {/* Row Error Log Table */}
              <div className="max-h-60 overflow-y-auto border border-gallery-border rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gallery-card font-serif uppercase tracking-wider text-[10px] text-gallery-muted">
                    <tr>
                      <th className="p-2">Row</th>
                      <th className="p-2">Artwork Title</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Validation Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gallery-border/60">
                    {summary.rowResults.map((res, i) => (
                      <tr key={i} className={res.isValid ? 'bg-emerald-50/40' : 'bg-red-50/40'}>
                        <td className="p-2 font-mono">{res.rowNumber}</td>
                        <td className="p-2 font-medium">{res.data.title || 'N/A'}</td>
                        <td className="p-2">
                          {res.isValid ? (
                            <span className="text-emerald-700 font-bold text-[10px] uppercase">PASS</span>
                          ) : (
                            <span className="text-red-700 font-bold text-[10px] uppercase">FAIL</span>
                          )}
                        </td>
                        <td className="p-2 text-red-700">
                          {res.errors.length > 0 ? res.errors.join('; ') : 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {committed ? (
                <div className="p-4 bg-emerald-100 border border-emerald-300 rounded text-emerald-900 text-xs flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-700 shrink-0" />
                  <span>Successfully committed {committedCount} valid artwork records to database!</span>
                </div>
              ) : (
                <button
                  onClick={handleCommit}
                  disabled={summary.validCount === 0}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-medium text-xs tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Commit {summary.validCount} Valid Artworks</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gallery-card/40 p-8 rounded-xl border border-dashed border-gallery-border text-center space-y-3">
              <FileText className="w-10 h-10 text-gallery-muted mx-auto" />
              <h4 className="font-serif text-lg text-gallery-dark">Validation Pending</h4>
              <p className="text-xs text-gallery-muted max-w-xs mx-auto">
                Paste or upload your artwork CSV spreadsheet on the left, then click "Validate CSV Rows".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
