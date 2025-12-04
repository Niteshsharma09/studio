
'use client';
import { useState, useEffect } from 'react';
import { useUser } from './use-user';

export function useAdmin() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      user.getIdTokenResult()
        .then(idTokenResult => {
          if (isMounted) {
            const claims = idTokenResult.claims;
            setIsAdmin(!!claims.isAdmin);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsAdmin(false);
            setLoading(false);
          }
        });
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
    return () => { isMounted = false };
  }, [user]);

  return { isAdmin, loading };
}
