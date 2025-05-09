// src/hooks/use-products.ts
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db as firestoreDB } from '@/lib/firebase/config';
import type { Product } from '@/types/product';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
}

export function useProducts(initialCategoryFilter?: string | null): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!firestoreDB) {
        setError(new Error("Firestore no está configurado."));
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const productsCollectionRef = collection(firestoreDB, 'products');
        let q;

        if (initialCategoryFilter) {
          // Firestore's string comparisons are case-sensitive.
          // To achieve case-insensitive like behavior, you might need to store categories in lowercase
          // or use a more advanced search solution. For now, we assume direct match.
          // Or, fetch all and filter client-side if dataset is small, but that's not efficient.
          // Let's assume category in DB is stored consistently e.g. lowercase or exact match to filter value.
          q = query(
            productsCollectionRef, 
            where('isActive', '==', true), 
            where('category', '==', initialCategoryFilter), 
            orderBy('name', 'asc')
          );
        } else {
          q = query(productsCollectionRef, where('isActive', '==', true), orderBy('name', 'asc'));
        }
        
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Ensure timestamps are converted to Date objects
            createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt || Date.now()),
            updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(data.updatedAt || Date.now()),
            // Ensure images and imagesRelated are arrays of strings
            images: Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? data.images.split(',').map((s:string) => s.trim()) : []),
            imagesRelated: Array.isArray(data.imagesRelated) ? data.imagesRelated : (typeof data.imagesRelated === 'string' ? data.imagesRelated.split(',').map((s:string) => s.trim()) : []),
            // Ensure dimensionData is an array of objects
            dimensionData: Array.isArray(data.dimensionData) ? data.dimensionData : [],
          } as Product;
        });
        setProducts(productsList);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialCategoryFilter]);

  return { products, loading, error };
}
