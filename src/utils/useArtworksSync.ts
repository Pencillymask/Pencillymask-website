import { useState, useEffect } from 'react';
import { artworkService } from '../services/artworkService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export function useArtworksSync() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // 1. Initial live fetch from Supabase
    artworkService.fetchLiveArtworksAsync().then(() => {
      setTick(t => t + 1);
    });

    // 2. Local custom event listener
    const handleUpdate = () => {
      setTick(t => t + 1);
    };
    window.addEventListener('dhruvi_artworks_updated', handleUpdate);

    // 3. Supabase Realtime Subscription for instant cross-device updates
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('public:artworks_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'artworks' },
            () => {
              artworkService.fetchLiveArtworksAsync().then(() => {
                setTick(t => t + 1);
              });
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    return () => {
      window.removeEventListener('dhruvi_artworks_updated', handleUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
}
