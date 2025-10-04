"use client";

type Props = {
  onTraffic: () => void;
  onPollution: () => void;
  onIncidence: () => void;
  onAI: () => void;
  onToggleSat: () => void;
  locText: string;
  satVisible: boolean;
};

export default function Sidebar(p: Props){
  return (
    <aside className="sidebar">
      <h2 className="title">MyCity Dashboard</h2>
      <p className="tag">Riobamba · demo</p>

      <button onClick={p.onTraffic}>Tráfico</button>
      <button onClick={p.onPollution}>Pollution</button>
      <button onClick={p.onIncidence}>Incidencias urbanas</button>
      <button onClick={p.onAI}>IA asistente</button>
      <hr/>
      <button onClick={p.onToggleSat}>{p.satVisible ? "Ocultar satélite" : "Mostrar satélite (GIBS)"}</button>

      <div className="footer">Ubicación: {p.locText}</div>
    </aside>
  );
}
