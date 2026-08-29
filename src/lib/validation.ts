import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  artworkId: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email('Valid admin email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;

export const artworkFormSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  currency: z.string().default('INR'),
  medium: z.string().min(2, 'Medium is required'),
  width: z.coerce.number().positive('Width must be greater than 0'),
  height: z.coerce.number().positive('Height must be greater than 0'),
  depth: z.coerce.number().default(1.5),
  year: z.coerce.number().min(1900).max(new Date().getFullYear()),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['draft', 'available', 'reserved', 'sold', 'archived']),
  featured: z.boolean().default(false),
  signed: z.boolean().default(true),
  certificateAvailable: z.boolean().default(true),
  frameType: z.string().default('Unframed Gallery Canvas'),
  frameIncluded: z.boolean().default(false),
  primaryImageUrl: z.string().url('Primary image URL is required'),
});

export type ArtworkFormData = z.infer<typeof artworkFormSchema>;

export const csvRowSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.coerce.number().min(0, 'Price must be a non-negative number'),
  medium: z.string().min(1, 'Medium is required'),
  width: z.coerce.number().positive('Width must be positive'),
  height: z.coerce.number().positive('Height must be positive'),
  year: z.coerce.number().min(1900),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['draft', 'available', 'reserved', 'sold', 'archived']).default('available'),
  description: z.string().optional(),
});

export type CsvRowData = z.infer<typeof csvRowSchema>;
