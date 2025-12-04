
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from '@/firebase';
import { collection, collectionGroup, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { Order, Product, User } from '@/lib/types';

interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalProducts: number;
  totalUsers: number;
}

export function useAdminDashboard() {
  const firestore = useFirestore();
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalSales: 0, totalProducts: 0, totalUsers: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      // Fetch all orders from all users
      const ordersQuery = query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc'));
      const ordersSnapshot = await getDocs(ordersQuery);
      let totalRevenue = 0;
      const totalSales = ordersSnapshot.size;
      const fetchedOrders: Order[] = [];
      ordersSnapshot.forEach(doc => {
        const orderData = doc.data() as Omit<Order, 'id'>;
        totalRevenue += orderData.totalAmount;
        fetchedOrders.push({ id: doc.id, ...orderData });
      });

      // Fetch products
      const productsSnapshot = await getDocs(collection(firestore, 'products'));
      const totalProducts = productsSnapshot.size;
      
      // Fetch users
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const totalUsers = usersSnapshot.size;


      setStats({ totalRevenue, totalSales, totalProducts, totalUsers });
      setRecentOrders(fetchedOrders.slice(0, 5));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, recentOrders, loading };
}


export function useAllOrders() {
    const firestore = useFirestore();
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllOrders = useCallback(async () => {
        if (!firestore) return;
        setLoading(true);
        try {
            const ordersQuery = query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const fetchedOrders: Order[] = [];
             for (const doc of ordersSnapshot.docs) {
                const orderData = doc.data() as Omit<Order, 'id' | 'items'>;
                const itemsQuery = query(collection(doc.ref, 'orderItems'));
                const itemsSnapshot = await getDocs(itemsQuery);
                const items = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() }));

                fetchedOrders.push({ id: doc.id, items, ...orderData } as Order);
            }
            setAllOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching all orders:", error);
        } finally {
            setLoading(false);
        }
    }, [firestore]);

    useEffect(() => {
        fetchAllOrders();
    }, [fetchAllOrders]);

    return { allOrders, loading };
}


type EnrichedUser = User & {
    photoURL?: string | null;
    displayName?: string | null;
    isAdmin: boolean;
};

export function useAllUsers() {
    const firestore = useFirestore();
    const [allUsers, setAllUsers] = useState<EnrichedUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllUsers = useCallback(async () => {
        if (!firestore) return;
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            // This part is tricky without backend logic to list all Auth users and their claims.
            // We'll fetch from Firestore and assume an `isAdmin` field might exist on the user document.
            // A proper implementation requires a backend function.
            const fetchedUsers = usersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email,
                    createdAt: data.createdAt,
                    displayName: data.firstName + ' ' + data.lastName,
                    photoURL: data.photoURL || null,
                    isAdmin: data.isAdmin === true // Check for isAdmin field in Firestore doc
                } as EnrichedUser;
            });
            setAllUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching all users:", error);
        } finally {
            setLoading(false);
        }
    }, [firestore]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    return { allUsers, loading };
}
