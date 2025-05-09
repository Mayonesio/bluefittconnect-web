// src/hooks/use-product-by-id.ts
"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db as firestoreDB } from '@/lib/firebase/config';
import type { Product } from '@/types/product';

interface UseProductByIdReturn {
  product: Product | null | undefined; // undefined for loading, null for not found
  loading: boolean;
  error: Error | null;
}

export function useProductById(productId: string | null): UseProductByIdReturn {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      if (!firestoreDB) {
        setError(new Error("Firestore no está configurado."));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const productDocRef = doc(firestoreDB, 'products', productId);
        const docSnap = await getDoc(productDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedProduct = {
            id: docSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt || Date.now()),
            updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(data.updatedAt || Date.now()),
            images: Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? data.images.split(',').map((s:string) => s.trim()) : []),
            imagesRelated: Array.isArray(data.imagesRelated) ? data.imagesRelated : (typeof data.imagesRelated === 'string' ? data.imagesRelated.split(',').map((s:string) => s.trim()) : []),
            dimensionData: Array.isArray(data.dimensionData) ? data.dimensionData : [],
          } as Product;
          setProduct(fetchedProduct);
        } else {
          setProduct(null); // Product not found
        }
        setError(null);
      } catch (err) {
        console.error(`Error fetching product ${productId}:`, err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}
