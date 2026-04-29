"use client";

import { useState, useCallback } from "react";
import { PollingPlace } from "@/lib/types";
import { useUserStore } from "@/store/useUserStore";

/**
 * Custom hook to manage polling place data fetching and search state.
 * Encapsulates side effects and business logic for the Polling feature.
 */
export function usePolling() {
  const [places, setPlaces] = useState<PollingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSearchLocation, setLastSearchLocation] = useState("");
  const { completeStep, setCurrentStep } = useUserStore();

  const fetchPlaces = useCallback(async (location: string, openOnly: boolean) => {
    setLoading(true);
    setLastSearchLocation(location);
    
    try {
      const params = new URLSearchParams({ 
        location, 
        openOnly: String(openOnly) 
      });
      
      const res = await fetch(`/api/polling?${params}`);
      
      if (!res.ok) {
        throw new Error(`Polling API error: ${res.statusText}`);
      }
      
      const data = await res.json();
      const results = data.places ?? [];
      
      setPlaces(results);
      
      // Update global user progress if search was successful
      if (results.length > 0) {
        completeStep(4);
        setCurrentStep(5);
      }
    } catch (error) {
      console.error("[usePolling] Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  }, [completeStep, setCurrentStep]);

  return {
    places,
    setPlaces,
    loading,
    lastSearchLocation,
    fetchPlaces,
  };
}
