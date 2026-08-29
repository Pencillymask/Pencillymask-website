import React, { useState } from 'react';
import { X, Trash2, MessageCircle, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { whatsappService } from '../../services/whatsappService';
import { GuestCheckoutModal } from './GuestCheckoutModal';

export const CartDrawer: React.FC = () => {
  const { items, removeFromCart, clearCart, isCartOpen, setIsCartOpen, subtotal } = useCart();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  if (!isCartOpen) return null;

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  // Generate WhatsApp inquiry text for all items in the inquiry list
  const createBatchWhatsAppUrl = () => {
    const phoneNumber = whatsappService.getPhoneNumber();
    const itemList = items
      .map(item => `• *${item.title}* (${item.width}"×${item.height}", ₹${item.price.toLocaleString('en-IN')})`)
      .join('\n');

    const message = `Hello Dhruvi,\n\nI am interested in acquiring the following original artwork:\n\n${itemList}\n\n*Total Value:* ${formattedSubtotal}\n\nPlease confirm availability and provide details regarding delivery and acquisition. Thank you!`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-gallery-bg border-l border-gallery-border shadow-2xl flex flex-col justify-between">
            
            {/* Header */}
            <div className="p-6 border-b border-gallery-border bg-white flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-gallery-dark font-medium">Artwork Inquiry List</h2>
                <p className="text-xs text-gallery-muted">Selected 1-of-1 original paintings ({items.length})</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-gallery-muted hover:text-gallery-dark hover:bg-gallery-card transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gallery-card flex items-center justify-center mx-auto text-gallery-muted">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl text-gallery-dark">Your list is empty</h3>
                  <p className="text-xs text-gallery-muted max-w-xs mx-auto">
                    Browse our gallery collection and select paintings to inquire about acquisition.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const primaryImg =
                    item.images.find(img => img.imageType === 'primary')?.storagePath ||
                    item.images[0]?.storagePath;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-white border border-gallery-border rounded-lg shadow-xs"
                    >
                      <img
                        src={primaryImg}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded bg-gallery-border/30"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base text-gallery-dark truncate font-medium">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gallery-muted truncate">{item.medium}</p>
                        <p className="text-[11px] text-gallery-muted/80">{item.width}" × {item.height}"</p>
                        <p className="font-serif text-sm font-semibold text-gallery-dark mt-1">
                          ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gallery-muted hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Subtotal & Action Buttons */}
            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-gallery-border space-y-4">
                <div className="flex items-center justify-between text-base">
                  <span className="text-gallery-muted">Total Portfolio Value:</span>
                  <span className="font-serif text-xl font-semibold text-gallery-dark">{formattedSubtotal}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gallery-available">
                  <CheckCircle className="w-4 h-4" />
                  <span>Free insured fine-art packaging & shipping within India</span>
                </div>

                <div className="space-y-2">
                  {/* Primary WhatsApp Inquiry */}
                  <a
                    href={createBatchWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-medium text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire via WhatsApp</span>
                  </a>

                  {/* Secondary Guest Order / Email Form */}
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-3 px-4 bg-gallery-dark hover:bg-gallery-gold text-white rounded font-medium text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Submit Collector Inquiry Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={clearCart}
                  className="w-full text-center text-xs text-gallery-muted hover:text-red-600 transition-colors pt-2"
                >
                  Clear Inquiry List
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guest Collector Inquiry Form Modal */}
      {showCheckoutModal && (
        <GuestCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}
    </>
  );
};
