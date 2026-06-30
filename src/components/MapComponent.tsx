"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
import { DonationType } from './dashboard/NgoView';

export default function MapComponent({ donations }: { donations: DonationType[] }) {
  const donationsWithCoords = donations.filter(d => d.coordinates && d.coordinates.lat && d.coordinates.lng);
  
  // Default to a central location (e.g., center of India or user's city if possible)
  // Let's use New Delhi as default if no donations have coords
  const center: [number, number] = donationsWithCoords.length > 0 
    ? [donationsWithCoords[0].coordinates!.lat, donationsWithCoords[0].coordinates!.lng]
    : [28.6139, 77.2090]; 

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-[hsl(var(--border))]">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {donationsWithCoords.map(donation => (
          <Marker 
            key={donation._id} 
            position={[donation.coordinates!.lat, donation.coordinates!.lng]}
            icon={icon}
          >
            <Popup>
              <strong>{donation.foodCategory}</strong><br/>
              Qty: {donation.quantity}<br/>
              Status: {donation.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
