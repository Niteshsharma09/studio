
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import type { Order, OrderItem } from '@/lib/types';

export function useOrders() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    if (!firestore || !user?.uid) {
        if (!userLoading) {
            setOrders([]);
            setLoading(false);
        }
        return;
    }
    
    setLoading(true);
    
    const ordersQuery = query(
        collection(firestore, `users/${user.uid}/orders`),
        orderBy('orderDate', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, async (querySnapshot) => {
        const fetchedOrders: Order[] = [];

        for (const doc of querySnapshot.docs) {
            const orderData = { id: doc.id, ...doc.data() } as Order;
            orderData.items = []; // Initialize items array

            // Fetch order items subcollection for each order
            const itemsQuery = query(collection(doc.ref, 'orderItems'));
            try {
                const itemsSnapshot = await getDocs(itemsQuery);
                itemsSnapshot.forEach((itemDoc) => {
                    orderData.items.push({ id: itemDoc.id, ...itemDoc.data() } as OrderItem);
                });
            } catch (itemsError) {
                console.error(`Error fetching items for order ${doc.id}:`, itemsError);
            }
            
            fetchedOrders.push(orderData);
        }
        setOrders(fetchedOrders);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setLoading(false);
    });

    return unsubscribe;
  }, [firestore, user?.uid, userLoading]);

  useEffect(() => {
    if (userLoading) return;
    const unsubscribe = fetchOrders();
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [userLoading, fetchOrders]);

  return { orders, loading: userLoading || loading };
}
