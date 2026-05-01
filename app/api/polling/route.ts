import { NextRequest, NextResponse } from "next/server";
import { MOCK_POLLING_PLACES } from "@/lib/constants";
import { PollingPlace } from "@/lib/types";

interface NominatimPlace {
  place_id: number;
  name?: string;
  display_name?: string;
  lat: string;
  lon: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") ?? "";

  let places: PollingPlace[] = [];

  if (location) {
    try {
      const query = encodeURIComponent(`school in ${location}, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`, {
        headers: { "User-Agent": "CivicPulse Election Assistant" }
      });
      const data: NominatimPlace[] = await res.json();

      if (data && data.length > 0) {
        places = data.map((r) => ({
          id: String(r.place_id),
          name: r.name || "Local Polling Center",
          address: r.display_name?.split(",").slice(0, 2).join(",") || location,
          city: location,
          state: "",
          zip: "",
          distance: +(Math.random() * 2 + 0.1).toFixed(1), // Mock distance
          waitTime: Math.floor(Math.random() * 30),
          isOpen: true,
          hours: "7:00 AM - 6:00 PM",
          lat: parseFloat(r.lat) || 0,
          lng: parseFloat(r.lon) || 0,
        }));
      }
    } catch (error) {
      console.error("Nominatim API error:", error);
    }
  }

  // Fallback to MOCK_POLLING_PLACES if no results or API fails
  if (places.length === 0) {
    places = MOCK_POLLING_PLACES.map((p) => ({
      ...p,
      waitTime: p.isOpen ? Math.floor(Math.random() * 30) : 0,
    }));
  }

  // Filter by open status if requested
  const openOnly = searchParams.get("openOnly") === "true";
  const filtered = openOnly ? places.filter((p) => p.isOpen) : places;

  return NextResponse.json({
    places: filtered,
    location,
    updatedAt: new Date().toISOString(),
  });
}
