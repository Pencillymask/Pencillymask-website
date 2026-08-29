import React, { useState } from 'react';
import { MessageCircle, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { whatsappService } from '../services/whatsappService';
import { artworkService } from '../services/artworkService';
import { SEO } from '../components/layout/SEO';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    artworkService.submitEnquiryAsync({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      channel: 'contact_form',
    });
  };

  const whatsappUrl = whatsappService.createGeneralInquiryUrl(
    formData.name || 'Collector',
    formData.subject || 'Commission Inquiry',
    formData.message || 'I would like to inquire about your original artwork.'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      <SEO
        title="Contact & Commission Inquiries"
        description="Get in touch with artist Dhruvi (pencillymask) for custom artwork commissions, studio visits, or fine art acquisition inquiries."
        keywords="contact Dhruvi, art commissions, custom painting inquiry, buy fine art, pencillymask studio"
      />
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gallery-gold font-bold">Studio Communications</span>
        <h1 className="font-serif text-4xl sm:text-5xl text-gallery-dark font-normal">
          Contact & Commissions
        </h1>
        <p className="text-sm text-gallery-muted leading-relaxed">
          Inquire about available paintings, private commissions, gallery exhibitions, or press inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Direct WhatsApp & Studio Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6 bg-white p-8 rounded-xl border border-gallery-border shadow-gallery">
          <div>
            <h3 className="font-serif text-2xl text-gallery-dark font-medium mb-2">Direct Studio Touchpoints</h3>
            <p className="text-xs text-gallery-muted leading-relaxed">
              For immediate response regarding artwork availability or custom dimensions, connect directly via WhatsApp.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs tracking-wider uppercase flex items-center gap-3 transition-colors shadow-md"
            >
              <MessageCircle className="w-6 h-6" />
              <div>
                <span className="block font-semibold">Instant WhatsApp Inquiry</span>
                <span className="text-[10px] opacity-90">Click to chat with Dhruvi</span>
              </div>
            </a>

            <div className="flex items-start gap-3 p-3 bg-gallery-card/50 rounded border border-gallery-border/60 text-xs text-gallery-dark">
              <Mail className="w-5 h-5 text-gallery-gold shrink-0 mt-0.5" />
              <div>
                <strong className="block font-serif text-sm">Studio Email</strong>
                <a href="mailto:pencillymask2512@gmail.com" className="text-gallery-muted hover:text-gallery-gold font-mono text-xs">
                  pencillymask2512@gmail.com
                </a>
              </div>
            </div>

            <a
              href="https://www.instagram.com/pencillymask"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 bg-gallery-card/50 rounded border border-gallery-border/60 text-xs text-gallery-dark hover:border-gallery-gold transition-colors"
            >
              <div className="w-5 h-5 text-gallery-gold shrink-0 font-bold">IG</div>
              <div>
                <strong className="block font-serif text-sm">Instagram Profile</strong>
                <span className="text-gallery-muted hover:text-gallery-gold font-mono text-xs">
                  @pencillymask
                </span>
              </div>
            </a>

            <div className="flex items-start gap-3 p-3 bg-gallery-card/50 rounded border border-gallery-border/60 text-xs text-gallery-dark">
              <MapPin className="w-5 h-5 text-gallery-gold shrink-0 mt-0.5" />
              <div>
                <strong className="block font-serif text-sm">Studio Location</strong>
                <span className="text-gallery-muted">India • By appointment only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-gallery-border shadow-gallery">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-2xl text-gallery-dark">Thank You for Reaching Out</h3>
              <p className="text-sm text-gallery-muted max-w-md mx-auto">
                Your message has been sent to Dhruvi's studio inbox. We will respond within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-gallery-dark text-white rounded text-xs uppercase tracking-wider font-medium"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-2xl text-gallery-dark font-medium mb-4">Send a Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="Collector Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gallery-dark mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                    placeholder="Artwork inquiry / Commission"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gallery-dark mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gallery-border rounded text-sm focus:outline-none focus:border-gallery-gold"
                  placeholder="Share details regarding your inquiry, preferred dimensions, or room setting..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gallery-dark hover:bg-gallery-gold text-white font-medium text-xs tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
