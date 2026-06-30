"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

import { DonationType } from './dashboard/NgoView';

const Map = dynamic<{ donations: DonationType[] }>(
  () => import('./MapComponent'),
  { ssr: false }
);

export default function MapWrapper({ donations }: { donations: DonationType[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
     queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) return <div className="h-[400px] w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;

  return <Map donations={donations} />;
}
