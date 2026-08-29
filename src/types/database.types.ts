export type ArtworkStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';

export type ImageType = 'primary' | 'angled' | 'detail' | 'room' | 'wide_angle' | 'back';

export interface ArtworkImage {
  id?: string;
  artworkId?: string;
  storagePath: string;
  imageType: ImageType;
  altText: string;
  sortOrder: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  parentId?: string | null;
}

export interface Collection {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  featured?: boolean;
}

export interface Artwork {
  id: string;
  artistId?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  medium: string;
  width: number;
  height: number;
  depth: number;
  year: number;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  subCategoryId?: string | null;
  subCategoryName?: string;
  subCategorySlug?: string;
  status: ArtworkStatus;
  reservationExpiresAt?: string;
  featured: boolean;
  signed: boolean;
  certificateAvailable?: boolean;
  frameType: string;
  frameIncluded: boolean;
  viewsCount?: number;
  images: ArtworkImage[];
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Address {
  id: string;
  customerId?: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  artworkId: string;
  artwork?: Artwork;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  addressId: string;
  address?: Address;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  courierName?: string;
  trackingNumber?: string;
  items?: OrderItem[];
  createdAt: string;
}

export interface Enquiry {
  id: string;
  artworkId?: string;
  artworkTitle?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  channel: 'contact_form' | 'whatsapp' | 'direct_inquiry';
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}

export interface Exhibition {
  id: string;
  title: string;
  slug: string;
  description: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  published: boolean;
}

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  publishedAt: string;
}

export interface AuditLog {
  id: string;
  adminId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  source?: string;
  createdAt?: string;
}

