"use client";
import { useEffect, useRef, useState } from "react";
import L, { Layer } from "leaflet";
import Sidebar from "@/components/Sidebar";

type Incident = { id:number; type:string; location:{lat:number; lng:number}; description?:string };

export default function Page(){
  const API = process.env.NEXT_PUBLIC_API_BASE!;
  const mapRef = useRef<L.Map|null>(null);
  const [loc, setLoc] = useState<{lat:number; lng:number}|null>(null);
  const [sat, setSat] = useState<Layer|null>(null);

  // Inicializa mapa y geolocalización
  useEffect(()=>{
    if(mapRef.current) return;
    const map = L.map("map", { center:[-1.664,-78.654], zoom:13, zoomControl:false });
    L.control.zoom({ position:"bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution:"© OpenStreetMap" }).addTo(map);
    mapRef.current = map;

    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((pos)=>{
        const { latitude, longitude } = pos.coords;
        setLoc({lat:latitude, lng:longitude});
        map.setView([latitude, longitude], 14);
        L.circleMarker([latitude, longitude], { radius:6 })
          .addTo(map).bindPopup("Mi ubicación");
      });
    }
  },[]);

  const locText = loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "detectando...";

  const toggleSat = async ()=>{
    if(!mapRef.current) return;
    if(sat){ mapRef.current.removeLayer(sat); setSat(null); return; }
    const res = await fetch(`${API}/tiles/gibs`);
    const d = await res.json();
    const tl = L.tileLayer(d.template, { maxZoom: 8, opacity: 0.85, attribution:"NASA GIBS" });
    tl.addTo(mapRef.current); setSat(tl);
  };

  const traffic = async ()=>{
    if(!mapRef.current) return;
    const b = mapRef.current.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const r = await fetch(`${API}/traffic`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ bbox, provider:"tomtom" })
    });
    const data = await r.json();
    alert(`Velocidad actual: ${data?.data?.flowSegmentData?.currentSpeed ?? "N/A"} km/h`);
  };

  const pollution = async ()=>{
    const pos = loc ?? { lat:-1.664, lng:-78.654 };
    const r = await fetch(`${API}/pollution`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ coords: pos, source:"openweather" })
    });
    const data = await r.json();
    const aqi = data?.data?.list?.[0]?.main?.aqi ?? "N/A";
    alert(`AQI (1=bueno..5=muy malo): ${aqi}`);
  };

  const incidence = async ()=>{
    if(!mapRef.current) return;
    const c = mapRef.current.getCenter();
    const r = await fetch(`${API}/incidents`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ type:"basura", location:{lat:c.lat, lng:c.lng}, description:"Reporte demo", reporter:"web" })
    });
    const inc = await r.json() as Incident;
    L.marker([inc.location.lat, inc.location.lng])
      .addTo(mapRef.current!)
      .bindPopup(`Incidencia #${inc.id}: ${inc.type}`);
  };

  const ai = async ()=>{
    const r = await fetch(`${API}/ai/insights`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ city:"Riobamba", metrics:{ pm25:22, traffic_index:0.58, incidents_24h:9 } })
    });
    const d = await r.json();
    alert(d.insights);
  };

  return (
    <div style={{display:"grid", gridTemplateColumns:"300px 1fr"}}>
      <Sidebar
        onTraffic={traffic}
        onPollution={pollution}
        onIncidence={incidence}
        onAI={ai}
        onToggleSat={toggleSat}
        locText={locText}
        satVisible={!!sat}
      />
      <div id="map" />
    </div>
  );
}
