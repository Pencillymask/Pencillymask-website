import { Artwork } from '../types/database.types';

export const whatsappService = {
  // Get active WhatsApp number strictly from environment variables, sanitizing digits
  getPhoneNumber(): string {
    const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
    return rawNumber.replace(/[^0-9]/g, '');
  },

  // Generate formatted WhatsApp URL for a specific artwork inquiry / purchase intent
  createArtworkInquiryUrl(artwork: Artwork, customMessage?: string): string {
    const phoneNumber = this.getPhoneNumber();
    const primaryImage =
      artwork.images?.find(img => img.imageType === 'primary')?.storagePath ||
      artwork.images?.[0]?.storagePath || '';

    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: artwork.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(artwork.price);

    const defaultText = `Hello Dhruvi,\n\nI am interested in acquiring your original painting:\n\n${primaryImage ? `Artwork Image: ${primaryImage}\n\n` : ''}🎨 *${artwork.title}*\n- *Medium:* ${artwork.medium}\n- *Dimensions:* ${artwork.width}" × ${artwork.height}"\n- *Price:* ${formattedPrice}\n\n${customMessage ? `Message: ${customMessage}` : 'Could you please confirm if this painting is available and provide information regarding domestic/international delivery?'}\n\nThank you!`;

    const encodedText = encodeURIComponent(defaultText);
    return `https://wa.me/${phoneNumber}?text=${encodedText}`;
  },

  // Generate WhatsApp link for general contact/commission inquiries
  createGeneralInquiryUrl(name: string, subject: string, message: string): string {
    const phoneNumber = this.getPhoneNumber();
    const defaultText = `Hello Dhruvi,\n\nMy name is *${name}*.\n*Subject:* ${subject}\n\n${message}`;
    const encodedText = encodeURIComponent(defaultText);
    return `https://wa.me/${phoneNumber}?text=${encodedText}`;
  }
};
