import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { whatsappService } from '../../services/whatsappService';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { items, setIsCartOpen } = useCart();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/collection' },
    { name: 'Available Art', path: '/available-art' },
    { name: 'Sold Works', path: '/sold-art' },
    { name: 'About Artist', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const whatsappNumber = whatsappService.getPhoneNumber();
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Dhruvi, I am browsing your portfolio website and would like to inquire about your original artwork.')}`;

  return (
    <header className="sticky top-0 z-40 bg-gallery-bg/95 backdrop-blur-md border-b border-gallery-border/60 transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gallery-dark hover:text-gallery-gold transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo / Brand Title */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.png"
              alt="pencillymask logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl tracking-[0.12em] font-semibold text-gallery-dark group-hover:text-gallery-gold transition-colors leading-tight">
                pencillymask
              </span>
              <span className="text-[9px] tracking-[0.2em] text-gallery-muted uppercase font-sans -mt-0.5 font-medium">
                Dhruvi's Art Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-8 whitespace-nowrap shrink-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs xl:text-sm tracking-widest uppercase transition-colors relative py-1 font-bold whitespace-nowrap ${
                    isActive
                      ? 'text-gallery-gold'
                      : 'text-gallery-dark hover:text-gallery-gold'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gallery-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Utilities (WhatsApp, Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            
            {/* Direct WhatsApp Chat Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gallery-gold/40 text-gallery-gold-dark hover:bg-gallery-gold/10 text-xs tracking-wider font-medium transition-all"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-gallery-gold/20" />
              <span>WhatsApp</span>
            </a>

            {/* Shopping Cart Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gallery-dark hover:text-gallery-gold transition-colors focus:outline-none"
              aria-label="Open Inquiry Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-1 right-1 bg-gallery-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gallery-bg border-b border-gallery-border px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-base tracking-wider uppercase font-bold ${
                  isActive ? 'text-gallery-gold pl-2 border-l-2 border-gallery-gold' : 'text-gallery-dark hover:text-gallery-gold'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-gallery-border flex items-center justify-between">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gallery-gold font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Direct WhatsApp Inquiry</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
