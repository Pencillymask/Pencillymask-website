import React, { useState } from 'react';
import { X, CheckCircle, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { whatsappService } from '../../services/whatsappService';

import { artworkService } from '../../services/artworkService';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestCheckoutModal: React.FC<GuestCheckoutModalProps> = ({ isOpen, onClose }) => {
  const { items, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    artworkService.submitOrderAsync({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      streetAddress: formData.streetAddress,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
      items,
      totalAmount: subtotal,
      notes: formData.notes,
    });
  };

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  const handleFinish = () => {
    clearCart();
    setSubmitted(false);
    onClose();
  };

  const whatsappNumber = whatsappService.getPhoneNumber();
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello Dhruvi,\n\nI have submitted an inquiry via your website.\n*Name:* ${formData.fullName}\n*Phone:* ${formData.phone}\n*City:* ${formData.city}\n*Artworks:* ${items.map(i => i.title).join(', ')}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gallery-bg border border-gallery-border rounded-xl max-w-xl w-full overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gallery-border bg-white flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl text-gallery-dark font-medium">Collector Inquiry Form</h3>
            <p className="text-xs text-gallery-muted">No account creation required • Direct studio communication</p>
          </div>
          <button onClick={onClose} className="p-2 text-gallery-muted hover:text-gallery-dark">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
              <h4 className="font-serif text-2xl text-gallery-dark">Inquiry Successfully Submitted</h4>
              <p className="text-sm text-gallery-muted max-w-md mx-auto">
                Thank you <strong>{formData.fullName}</strong>. Your inquiry for original paintings ({items.map(i => i.title).join(', ')}) has been received. Artist Dhruvi will reach out directly via email ({formData.email}) or phone.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Speed up on WhatsApp</span>
                </a>
                <button
                  onClick={handleFinish}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gallery-dark text-white rounded text-xs font-semibold uppercase tracking-wider"
                >
                  Back to Portfolio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-white border border-gallery-border rounded text-xs text-gallery-dark/80 flex items-center justify-between">
                <span>Selected Artworks ({items.length}):</span>
                <strong className="font-serif text-sm font-semibold">{formattedSubtotal}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">City / Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="Mumbai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gallery-dark mb-1">Shipping Address</label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  placeholder="Street address, building name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gallery-dark mb-1">Custom Notes / Framing Request</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  placeholder="Inquire about custom framing options, room suitability, or delivery timelines..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gallery-dark hover:bg-gallery-gold text-white font-medium text-xs tracking-wider uppercase rounded transition-colors"
              >
                Submit Direct Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
