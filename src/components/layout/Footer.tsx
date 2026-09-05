import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Mail, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { whatsappService } from '../../services/whatsappService';
import { artworkService } from '../../services/artworkService';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    setSubscribeStatus('idle');

    try {
      const result = await artworkService.subscribeNewsletterAsync(email, 'footer');
      if (result.success) {
        setSubscribeStatus('success');
        setFeedbackMessage(result.message || 'Thank you! You are now subscribed to private collector drops.');
        setEmail('');
        setTimeout(() => {
          setSubscribeStatus('idle');
          setFeedbackMessage('');
        }, 6000);
      } else {
        setSubscribeStatus('error');
        setFeedbackMessage(result.message || 'Unable to subscribe at this moment. Please try again.');
        setTimeout(() => {
          setSubscribeStatus('idle');
          setFeedbackMessage('');
        }, 6000);
      }
    } catch (err) {
      setSubscribeStatus('error');
      setFeedbackMessage('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappNumber = whatsappService.getPhoneNumber();
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Dhruvi, I would like to stay updated on your new original artwork releases.')}`;

  return (
    <footer className="bg-[#141312] text-gallery-bg border-t border-gallery-dark/20 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">

          {/* Col 1: Studio Info & Provenance */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo.png"
                alt="pencillymask logo"
                className="h-12 w-auto object-contain brightness-110 drop-shadow-md"
              />
              <div>
                <h3 className="font-serif text-2xl tracking-wider text-white">pencillymask</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-gallery-gold font-medium mt-0.5">Dhruvi's Art Studio</p>
              </div>
            </div>
            <p className="text-sm text-gallery-bg/70 leading-relaxed">
              Original fine art paintings, rich textural oils, and contemporary mixed media canvases. Every painting is a unique 1-of-1 original artwork created in studio.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gallery-gold hover:text-gallery-dark flex items-center justify-center transition-colors text-white"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/pencillymask"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gallery-gold hover:text-gallery-dark flex items-center justify-center transition-colors text-white"
                title="Instagram (@pencillymask)"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:pencillymask2512@gmail.com"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-gallery-gold hover:text-gallery-dark flex items-center justify-center transition-colors text-white"
                title="Email Studio (pencillymask2512@gmail.com)"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">Explore Gallery</h4>
            <ul className="space-y-2.5 text-sm text-gallery-bg/70">
              <li>
                <Link to="/collection" className="hover:text-gallery-gold transition-colors">
                  Artwork Collection
                </Link>
              </li>
              <li>
                <Link to="/available-art" className="hover:text-gallery-gold transition-colors">
                  Available Paintings
                </Link>
              </li>
              <li>
                <Link to="/sold-art" className="hover:text-gallery-gold transition-colors">
                  Sold Artwork
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Information & Services */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">Artist & Studio</h4>
            <ul className="space-y-2.5 text-sm text-gallery-bg/70">
              <li>
                <Link to="/about" className="hover:text-gallery-gold transition-colors">
                  About Artist
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gallery-gold transition-colors">
                  Commissions & Inquiries
                </Link>
              </li>

            </ul>
          </div>

          {/* Col 4: Newsletter Signup */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4 tracking-wide">Private Collector List</h4>
            <p className="text-sm text-gallery-bg/70 mb-4 leading-relaxed">
              Subscribe to receive preview invitations for new original painting drops prior to public gallery listing.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-gallery-gold transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-1 top-1 bottom-1 px-3 bg-gallery-gold hover:bg-gallery-gold-dark text-gallery-dark rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Subscribe to Collector List"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {subscribeStatus === 'success' && (
                <p className="text-xs text-green-400 flex items-center gap-1.5 mt-1.5 animate-fadeIn">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{feedbackMessage}</span>
                </p>
              )}
              {subscribeStatus === 'error' && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{feedbackMessage}</span>
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gallery-bg/50">
          <p>© {new Date().getFullYear()} pencillymask — Dhruvi's Art Studio. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0 tracking-wider">Developed by Nandan Gogari</p>
        </div>
      </div>
    </footer>
  );
};
