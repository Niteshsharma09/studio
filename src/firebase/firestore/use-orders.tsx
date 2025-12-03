
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, collectionGroup, getDocs } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';
import { useMemo } from 'react';

export function useOrders() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const memoizedUserId = useMemo(() => user?.uid, [user?.uid]);

  const fetchOrders = useCallback(() => {
    if (!firestore || !memoizedUserId) {
        if (!userLoading) {
            setLoading(false);
        }
        return;
    }
    
    setLoading(true);
    
    const ordersQuery = query(
        collection(firestore, `users/${memoizedUserId}/orders`),
        orderBy('orderDate', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, async (querySnapshot) => {
        const fetchedOrders: Order[] = [];

        for (const doc of querySnapshot.docs) {
            const orderData = { id: doc.id, ...doc.data() } as Order;
            orderData.items = []; // Initialize items array

            // Fetch order items subcollection for each order
            const itemsQuery = query(collection(doc.ref, 'orderItems'));
            const itemsSnapshot = await getDocs(itemsQuery);
            itemsSnapshot.forEach((itemDoc) => {
                orderData.items.push({ id: itemDoc.id, ...itemDoc.data() } as OrderItem);
            });
            
            fetchedOrders.push(orderData);
        }
        setOrders(fetchedOrders);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching orders:", error);
        setLoading(false);
    });

    return unsubscribe;
  }, [firestore, memoizedUserId, userLoading]);

  useEffect(() => {
    const unsubscribe = fetchOrders();
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [fetchOrders]);

  return { orders, loading: userLoading || loading };
}
