import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { useArtworksSync } from './utils/useArtworksSync';

// Pages
import { Home } from './pages/Home';
import { Collection } from './pages/Collection';
import { ArtworkDetail } from './pages/ArtworkDetail';
import { AvailableArt } from './pages/AvailableArt';
import { SoldArt } from './pages/SoldArt';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminArtworks } from './pages/admin/AdminArtworks';
import { AdminBulkImport } from './pages/admin/AdminBulkImport';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Scroll To Top on Route Change & Global Image Protection
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Image Protection & Anti-Screenshot Hook
const ImageProtection = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable all image protection & restrictions on admin pages
    if (pathname.startsWith('/admin')) {
      // Ensure any lingering blur is removed
      const main = document.querySelector('main');
      if (main) main.classList.remove('privacy-blur-active');
      return;
    }

    // 1. Prevent Right Click on Images in public gallery
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img') || target.classList.contains('image-shield')) {
        e.preventDefault();
      }
    };

    // 2. Prevent Dragging Images out of public gallery
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' || target.closest('img')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [pathname]);

  // Global window drop safety: prevents browser from navigating away or opening dropped files in new tab
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleGlobalDrop = (e: DragEvent) => {
      // Only prevent if the drop didn't occur inside a dedicated form / dropzone handler
      const target = e.target as HTMLElement;
      if (!target.closest('input[type="file"]') && !target.closest('label')) {
        e.preventDefault();
      }
    };

    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('drop', handleGlobalDrop);

    return () => {
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  return null;
};

export const App: React.FC = () => {
  useArtworksSync();

  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <ImageProtection />
        <div className="min-h-screen flex flex-col justify-between bg-gallery-bg text-gallery-dark font-sans selection:bg-gallery-gold/30">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/artwork/:slug" element={<ArtworkDetail />} />
              <Route path="/available-art" element={<AvailableArt />} />
              <Route path="/sold-art" element={<SoldArt />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/artworks" element={<AdminArtworks />} />
              <Route path="/admin/bulk-import" element={<AdminBulkImport />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            </Routes>
          </main>
          <CartDrawer />
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
};

export default App;
