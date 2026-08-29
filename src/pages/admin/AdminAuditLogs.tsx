import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { SEO } from '../../components/layout/SEO';

export const AdminAuditLogs: React.FC = () => {
  const auditLogs = [
    {
      id: 'log-1',
      admin: 'Dhruvi Studio Admin',
      action: 'UPDATE_ARTWORK_STATUS',
      entity: 'artworks/whispers-of-gold-and-earth',
      details: 'Changed status from AVAILABLE to RESERVED for WhatsApp inquiry',
      timestamp: '2026-08-22 14:30:12',
    },
    {
      id: 'log-2',
      admin: 'Dhruvi Studio Admin',
      action: 'BULK_CSV_IMPORT',
      entity: 'artworks/batch-200',
      details: 'Batch imported 200 artwork entries into local database',
      timestamp: '2026-08-22 14:15:00',
    },
    {
      id: 'log-3',
      admin: 'Dhruvi Studio Admin',
      action: 'UPDATE_ARTWORK_PRICE',
      entity: 'artworks/crimson-nocturne',
      details: 'Updated price to ₹1,20,000 INR and marked SOLD',
      timestamp: '2026-08-21 18:45:22',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fadeIn">
      <SEO title="Studio Audit Logs" noindex={true} />
      <div>
        <Link to="/admin/dashboard" className="text-xs text-gallery-muted hover:text-gallery-dark flex items-center gap-1 mb-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="font-serif text-3xl text-gallery-dark font-medium">Studio Audit Logs</h1>
        <p className="text-xs text-gallery-muted">Audit trail recording admin mutations, price changes, and security events.</p>
      </div>

      <div className="bg-white border border-gallery-border rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-gallery-card border-b border-gallery-border font-serif uppercase tracking-wider text-[10px] text-gallery-muted">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Admin User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity Reference</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gallery-border/60">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gallery-bg/50">
                <td className="p-3 font-mono text-gallery-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gallery-gold" />
                  <span>{log.timestamp}</span>
                </td>
                <td className="p-3 font-medium">{log.admin}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-gallery-card border border-gallery-border rounded text-[10px] font-mono uppercase">
                    {log.action}
                  </span>
                </td>
                <td className="p-3 font-mono text-gallery-muted">{log.entity}</td>
                <td className="p-3 text-gallery-dark/90">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
