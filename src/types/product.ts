// src/types/product.ts
import type { Timestamp } from 'firebase/firestore';

export interface ProductDimensionDataItem {
  label: string; // e.g., "Length", "Diameter", "Pressure Rating"
  value: string; // e.g., "100mm", "DN50", "PN16"
}

export interface Product {
  id: string; // Firestore document ID
  code: string; // Product SKU or internal code
  gtin13?: string; // EAN/UPC
  name: string; // Primary display name
  title?: string; // Detailed title, possibly for SEO or longer display
  measure?: string; // Unit of measure or size, e.g., "DN25", "1/2\"", "50m roll"
  seoTitle?: string; // SEO-optimized title
  description: string; // Detailed product description
  category: string; // Category name (e.g., "Válvula", "Racor"). Consider using category IDs for relationships.
  brand?: string; // Brand name. Consider using brand IDs for relationships.
  dimensionImage?: string; // URL to an image showing product dimensions
  dimensionData?: ProductDimensionDataItem[]; // Array of structured dimension information
  images: string[]; // Array of URLs for primary product images
  imagesRelated?: string[]; // Array of URLs for related product images or accessories

  // Recommended additional fields
  price?: number; // Price in the smallest currency unit (e.g., cents) to avoid floating point issues
  stock?: number; // Stock quantity
  isActive: boolean; // To control visibility in the catalog (published/unpublished)
  
  // Firestore timestamps
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;

  // For UI and temporary data not in Firestore directly, like aiHint in previous samples
  aiHint?: string; 
}

// Example of how you might structure a Category or Brand type if using references
export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
}
