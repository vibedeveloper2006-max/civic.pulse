"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { PollingPlace } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/store/useUserStore";
import {
  MapPin, Clock, Navigation, RefreshCw, Search,
  CheckCircle2, XCircle, Filter,
} from "lucide-react";

import { usePolling } from "@/hooks/usePolling";

// Strict typing for Google Maps Global using official types
declare global {
  interface Window {
    google: typeof google;
  }
}

function PlaceCard({ place, isNearest }: { place: PollingPlace; isNearest: boolean }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${place.name}, ${place.address}, ${place.city}, ${place.state}`
  )}`;

  return (
    <Card elevated className={`animate-fade-in ${isNearest ? "border-[#002855]" : ""}`}>
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            {isNearest && (
              <Badge variant="info" className="mb-1.5">📍 Nearest to You</Badge>
            )}
            <h3 className="font-bold text-[#181c1e] text-sm">{place.name}</h3>
            <p className="text-xs text-[#43474f] mt-0.5">
              {place.address}, {place.city}, {place.state} {place.zip}
            </p>
          </div>
          <Badge variant={place.isOpen ? "success" : "neutral"}>
            {place.isOpen ? (
              <><CheckCircle2 className="w-3 h-3" /> Open</>
            ) : (
              <><XCircle className="w-3 h-3" /> Closed</>
            )}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#f1f4f6] rounded p-2 text-center">
            <MapPin className="w-3.5 h-3.5 text-[#002855] mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#181c1e]">{place.distance} mi</p>
            <p className="text-[10px] text-[#43474f]">Distance</p>
          </div>
          <div className="bg-[#f1f4f6] rounded p-2 text-center">
            <Clock className="w-3.5 h-3.5 text-[#002855] mx-auto mb-0.5" />
            <p className="text-xs font-bold text-[#181c1e]">
              {place.isOpen ? `~${place.waitTime} min` : "—"}
            </p>
            <p className="text-[10px] text-[#43474f]">Wait Time</p>
          </div>
          <div className="bg-[#f1f4f6] rounded p-2 text-center">
            <Clock className="w-3.5 h-3.5 text-[#005596] mx-auto mb-0.5" />
            <p className="text-[10px] font-bold text-[#181c1e]">{place.hours}</p>
            <p className="text-[10px] text-[#43474f]">Hours</p>
          </div>
        </div>

        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant={place.isOpen ? "primary" : "outline"}
            size="sm"
            className="w-full gap-2"
            disabled={!place.isOpen}
          >
            <Navigation className="w-3.5 h-3.5" />
            {place.isOpen ? "Get Directions" : "Polling Place Closed"}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}

/**
 * Main Polling page component.
 * Allows users to search for polling stations and visualize them on a map.
 */
export default function PollingPage() {
  const { 
    places, 
    setPlaces, 
    loading, 
    lastSearchLocation, 
    fetchPlaces 
  } = usePolling();

  const [searchInput, setSearchInput] = useState("");
  const [openOnly, setOpenOnly] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const google = window.google;
    if (google?.maps && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 }, // New Delhi default
        zoom: 12,
        disableDefaultUI: true,
      });
    }

    if (mapInstanceRef.current && google?.maps) {
      // Clear old markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // Add new markers
      places.forEach((p, i) => {
        if (p.lat && p.lng && mapInstanceRef.current) {
          const marker = new google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map: mapInstanceRef.current,
            title: p.name,
            icon: i === 0 
              ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
              : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
          });
          markersRef.current.push(marker);
        }
      });

      // Recenter to the first result
      if (places.length > 0 && places[0].lat && mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: places[0].lat, lng: places[0].lng });
        mapInstanceRef.current.setZoom(14);
      }
    }
  }, [places]);

  // Initial load
  useEffect(() => { 
    fetchPlaces("", openOnly); 
  }, [fetchPlaces, openOnly]);

  /**
   * Triggers a new search based on current input and filters.
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchPlaces(searchInput, openOnly);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181c1e]">Find Your Polling Place</h1>
        <p className="text-[#43474f] mt-1 text-sm">
          Locate nearby polling places, check wait times, and get directions.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747780]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter your address or ZIP code..."
              aria-label="Search polling places by address or ZIP code"
              className="w-full pl-9 pr-4 py-2.5 border border-[#c4c6d0] rounded text-sm bg-white focus:outline-none focus:border-[#002855] transition-colors"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" aria-busy={loading}>Search</Button>
        </form>
        <div className="flex gap-2">
          <Button
            variant={openOnly ? "primary" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => { setOpenOnly(!openOnly); fetchPlaces(searchInput, !openOnly); }}
          >
            <Filter className="w-4 h-4" />
            {openOnly ? "Open Only" : "All Places"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => fetchPlaces(searchInput, openOnly)}
            title="Refresh wait times"
            aria-busy={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-64 rounded border border-[#c4c6d0] bg-[#ebeef0] flex items-center justify-center overflow-hidden relative">
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <>
            <div ref={mapRef} className="absolute inset-0 z-10" />
            <Script
              src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
              onLoad={() => {
                if (mapRef.current && window.google && !mapInstanceRef.current) {
                  mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 28.6139, lng: 77.2090 }, // New Delhi
                    zoom: 12,
                    disableDefaultUI: true,
                  });
                  // Trigger initial render if places already loaded
                  if (places.length > 0) setPlaces([...places]);
                }
              }}
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#d6e3ff] to-[#ebeef0]" />
            <div className="relative text-center">
              <MapPin className="w-8 h-8 text-[#002855] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#002855]">Interactive Map</p>
              <p className="text-xs text-[#43474f]">Configure GOOGLE_MAPS_API_KEY for live map</p>
            </div>
            {/* Simulated map pins */}
            {places.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className="absolute"
                style={{ left: `${25 + i * 22}%`, top: `${30 + (i % 2) * 25}%` }}
              >
                <div className={`w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center ${p.isOpen ? "bg-[#002855]" : "bg-[#747780]"}`}>
                  <MapPin className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Live data badge */}
      <div className="flex items-center justify-between text-xs text-[#43474f]">
        <span>{places.length} locations found</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Wait times updated live
        </span>
      </div>

      {/* Polling place cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded border border-[#ebeef0] bg-[#f1f4f6] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {places.map((place, i) => (
            <PlaceCard key={place.id} place={place} isNearest={i === 0} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-[#43474f] text-center">
        Wait times are simulated estimates. Verify your polling place at{" "}
        <a href="https://voters.eci.gov.in/" target="_blank" rel="noopener noreferrer" className="text-[#002855] underline">
          voters.eci.gov.in
        </a>
      </p>
    </div>
  );
}
