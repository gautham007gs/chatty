
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { AdminStatusDisplay, ManagedContactStatus } from '@/types';
import { ADMIN_OWN_STATUS_CONFIG_KEY, MANAGED_DEMO_CONTACTS_CONFIG_KEY } from '@/types';
import { defaultAdminStatusDisplay, defaultManagedContactStatuses } from '@/config/ai';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface GlobalStatusContextType {
  adminOwnStatus: AdminStatusDisplay | null;
  managedDemoContacts: ManagedContactStatus[] | null;
  isLoadingGlobalStatuses: boolean;
  fetchGlobalStatuses: () => Promise<void>;
  // updateAdminOwnStatus: (newStatus: AdminStatusDisplay) => Promise<void>; // May not be needed here if admin panel handles saves
  // updateManagedDemoContacts: (newContacts: ManagedContactStatus[]) => Promise<void>; // May not be needed here
}

const GlobalStatusContext = createContext<GlobalStatusContextType | undefined>(undefined);

export const GlobalStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminOwnStatus, setAdminOwnStatus] = useState<AdminStatusDisplay | null>(null);
  const [managedDemoContacts, setManagedDemoContacts] = useState<ManagedContactStatus[] | null>(null);
  const [isLoadingGlobalStatuses, setIsLoadingGlobalStatuses] = useState(true);
  const { toast } = useToast();

  const fetchGlobalStatuses = useCallback(async () => {
    setIsLoadingGlobalStatuses(true);
    if (!supabase) {
      console.warn("Supabase client not available for fetching global statuses. Using defaults.");
      setAdminOwnStatus(defaultAdminStatusDisplay);
      setManagedDemoContacts(defaultManagedContactStatuses);
      setIsLoadingGlobalStatuses(false);
      return;
    }

    try {
      // Fetch Admin's Own Status
      const { data: adminStatusData, error: adminStatusError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', ADMIN_OWN_STATUS_CONFIG_KEY)
        .single();

      if (adminStatusError && adminStatusError.code !== 'PGRST116') {
        console.error('Error fetching admin own status from Supabase:', adminStatusError);
        toast({ title: "Error Loading Admin Status", description: `Could not load global admin status. Using defaults. ${adminStatusError.message}`, variant: "destructive" });
        setAdminOwnStatus(defaultAdminStatusDisplay);
      } else if (adminStatusData && adminStatusData.settings) {
        setAdminOwnStatus({ ...defaultAdminStatusDisplay, ...(adminStatusData.settings as AdminStatusDisplay) });
      } else {
        setAdminOwnStatus(defaultAdminStatusDisplay);
      }

      // Fetch Managed Demo Contacts
      const { data: demoContactsData, error: demoContactsError } = await supabase
        .from('app_configurations')
        .select('settings')
        .eq('id', MANAGED_DEMO_CONTACTS_CONFIG_KEY)
        .single();
      
      if (demoContactsError && demoContactsError.code !== 'PGRST116') {
        console.error('Error fetching managed demo contacts from Supabase:', demoContactsError);
        toast({ title: "Error Loading Demo Contacts", description: `Could not load global demo contacts. Using defaults. ${demoContactsError.message}`, variant: "destructive" });
        setManagedDemoContacts(defaultManagedContactStatuses);
      } else if (demoContactsData && Array.isArray(demoContactsData.settings)) {
         // Ensure defaultManagedContactStatuses provides a fallback for each ID if needed, or merge carefully
        const fetchedContacts = demoContactsData.settings as ManagedContactStatus[];
        // A simple merge: override defaults with fetched if IDs match, then add any new fetched.
        // For a more robust merge, you might iterate and update based on ID.
        // Here, we assume the fetched data is the complete source of truth if present.
        setManagedDemoContacts(fetchedContacts);
      } else {
        setManagedDemoContacts(defaultManagedContactStatuses);
      }

    } catch (e: any) {
      console.error('Unexpected error fetching global statuses:', e);
      toast({ title: "Error Loading Global Statuses", description: `Unexpected error. Using defaults. ${e.message}`, variant: "destructive" });
      setAdminOwnStatus(defaultAdminStatusDisplay);
      setManagedDemoContacts(defaultManagedContactStatuses);
    } finally {
      setIsLoadingGlobalStatuses(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGlobalStatuses();
  }, [fetchGlobalStatuses]);

  return (
    <GlobalStatusContext.Provider value={{ adminOwnStatus, managedDemoContacts, isLoadingGlobalStatuses, fetchGlobalStatuses }}>
      {children}
    </GlobalStatusContext.Provider>
  );
};

export const useGlobalStatus = (): GlobalStatusContextType => {
  const context = useContext(GlobalStatusContext);
  if (context === undefined) {
    throw new Error('useGlobalStatus must be used within a GlobalStatusProvider');
  }
  return context;
};
