import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, CheckCircle, Clock, ShoppingBag, DollarSign, Upload, ShieldAlert, LogOut } from 'lucide-react';
import { artworkService } from '../../services/artworkService';
import { SEO } from '../../components/layout/SEO';

export const AdminDashboard: React.FC = () => {
  const [stats] = useState(() => artworkService.getDashboardStats());

  const handleLogout = () => {
    localStorage.removeItem('dhruvi_admin_token');
    window.location.href = '/admin';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <SEO title="Studio Management Dashboard" noindex={true} />
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gallery-border pb-4 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-gallery-gold font-bold">Studio Management</span>
          <h1 className="font-serif text-3xl text-gallery-dark font-medium">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/artworks"
            className="px-4 py-2 bg-gallery-dark text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-gallery-gold transition-colors"
          >
            Manage Artworks
          </Link>
          <Link
            to="/admin/bulk-import"
            className="px-4 py-2 border border-gallery-border bg-white text-gallery-dark rounded text-xs font-semibold uppercase tracking-wider hover:bg-gallery-card transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-gallery-gold" />
            <span>CSV Import</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-gallery-muted hover:text-red-600 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="p-4 bg-white rounded-lg border border-gallery-border shadow-xs space-y-1">
          <span className="text-[11px] text-gallery-muted uppercase tracking-wider flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-gallery-gold" /> Total Art
          </span>
          <p className="font-serif text-2xl font-semibold text-gallery-dark">{stats.totalArtworks}</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gallery-border shadow-xs space-y-1">
          <span className="text-[11px] text-gallery-muted uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-gallery-available" /> Available
          </span>
          <p className="font-serif text-2xl font-semibold text-gallery-available">{stats.availableArtworks}</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gallery-border shadow-xs space-y-1">
          <span className="text-[11px] text-gallery-muted uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Reserved
          </span>
          <p className="font-serif text-2xl font-semibold text-amber-700">{stats.reservedArtworks}</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gallery-border shadow-xs space-y-1">
          <span className="text-[11px] text-gallery-muted uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-gallery-sold" /> Sold Works
          </span>
          <p className="font-serif text-2xl font-semibold text-gallery-sold">{stats.soldArtworks}</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gallery-border shadow-xs space-y-1">
          <span className="text-[11px] text-gallery-muted uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Revenue
          </span>
          <p className="font-serif text-xl font-semibold text-gallery-dark">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gallery-border shadow-xs space-y-1">
          <span className="text-[11px] text-gallery-muted uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" /> Enquiries
          </span>
          <p className="font-serif text-2xl font-semibold text-blue-700">{stats.pendingEnquiries}</p>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white rounded-xl border border-gallery-border space-y-3 shadow-xs">
          <h3 className="font-serif text-xl text-gallery-dark font-medium">Artwork Management</h3>
          <p className="text-xs text-gallery-muted">
            Add new paintings, reorder photos, update prices, change status (Available / Sold / Reserved), and manage category tags.
          </p>
          <Link
            to="/admin/artworks"
            className="inline-block pt-2 text-xs font-semibold uppercase tracking-wider text-gallery-gold hover:underline"
          >
            Manage 200+ Artworks →
          </Link>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gallery-border space-y-3 shadow-xs">
          <h3 className="font-serif text-xl text-gallery-dark font-medium">CSV Bulk Import</h3>
          <p className="text-xs text-gallery-muted">
            Batch upload artwork inventory via CSV spreadsheet with automated Zod row validation and error reporting.
          </p>
          <Link
            to="/admin/bulk-import"
            className="inline-block pt-2 text-xs font-semibold uppercase tracking-wider text-gallery-gold hover:underline"
          >
            Open CSV Importer →
          </Link>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gallery-border space-y-3 shadow-xs">
          <h3 className="font-serif text-xl text-gallery-dark font-medium">Audit Logs</h3>
          <p className="text-xs text-gallery-muted">
            Inspect security events, price modifications, and status changes recorded by the studio backend.
          </p>
          <Link
            to="/admin/audit-logs"
            className="inline-block pt-2 text-xs font-semibold uppercase tracking-wider text-gallery-gold hover:underline"
          >
            View System Audit Logs →
          </Link>
        </div>
      </div>
    </div>
  );
};
