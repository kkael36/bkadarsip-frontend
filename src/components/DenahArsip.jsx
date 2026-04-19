import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RackModal from "../components/RackModal";
import { useAuth } from "../context/AuthContext"; 

// --- ENGINE KOORDINAT MATEMATIS 1:1 DENGAN SVG ASLI ---
const buildH = (startX, startY, prefix, ranges) => ranges.map((r, i) => {
  const [from, to] = r.split('-').map(Number);
  return { label: r, x: startX + i * 92, y: startY, w: 84, h: 32, from, to, prefix, isVert: false };
});

const buildV = (startX, startY, prefix, ranges) => ranges.map((r, i) => {
  const [from, to] = r.split('-').map(Number);
  return { label: r, x: startX, y: startY + i * 92, w: 36, h: 84, from, to, prefix, isVert: true };
});

export default function DenahArsip({ boxes = [] }) {
  const { user } = useAuth(); // 🔥 Ambil data user
  const navigate = useNavigate();
  const [activeRack, setActiveRack] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);
  
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.0)); 
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25)); 
  const handleResetZoom = () => setZoom(1);

  const LABELED_RACKS = [
    // TIER 1
    ...buildH(463, 4, 'B', ["29-35", "36-42", "43-49", "50-56"]),
    ...buildH(463, 48, 'B', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(1126, 4, 'A', ["29-35", "36-42", "43-49", "50-56"]),
    ...buildH(1126, 48, 'A', ["1-7", "8-14", "15-21", "22-28"]),

    // TIER 2
    ...buildH(463, 140, 'D', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(463, 184, 'D', ["50-56", "43-49", "36-42", "29-35"]),
    ...buildH(1126, 140, 'C', ["15-21", "8-14", "1-7"]),
    ...buildH(1126, 184, 'C', ["36-42", "29-35", "22-28"]),

    // TIER 3
    ...buildH(463, 276, 'F', ["22-28", "15-21", "8-14", "1-7"]),
    ...buildH(463, 320, 'F', ["50-56", "43-49", "36-42", "29-35"]),
    ...buildH(1126, 276, 'F', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(1126, 320, 'F', ["29-35", "36-42", "43-49", "50-56"]),

    // TIER 4
    ...buildH(463, 408, 'G', ["22-28", "15-21", "8-14", "1-7"]),
    ...buildH(463, 452, 'G', ["29-35", "36-42", "43-49", "50-56"]),

    // TIER 5
    ...buildV(100, 644, 'L', ["50-56", "43-49", "36-42", "29-35"]),
    ...buildV(144, 644, 'L', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildV(208, 644, 'K', ["50-56", "43-49", "36-42", "29-35"]),
    ...buildV(252, 644, 'K', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(463, 644, 'H', ["50-56", "43-49", "36-42", "29-35"]),
    ...buildH(463, 688, 'H', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(1126, 644, 'N', ["1-7", "8-14"]),
    ...buildH(1126, 688, 'N', ["15-21", "22-28"]),

    // TIER 6
    ...buildH(463, 780, 'M', ["22-28", "15-21", "8-14", "1-7"]),
    ...buildH(463, 824, 'M', ["50-56", "43-49", "36-42", "29-35"]),
    ...buildH(1126, 780, 'T', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(1126, 824, 'T', ["50-56", "43-49", "36-42", "29-35"]),

    // TIER 7
    ...buildH(463, 916, 'I', ["22-28", "15-21", "8-14", "1-7"]),
    ...buildH(463, 960, 'I', ["50-56", "43-49", "36-42", "29-35"]),
    ...buildH(1126, 916, 'W', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(1126, 960, 'W', ["50-56", "43-49", "36-42", "29-35"]),

    // TIER 8
    ...buildH(100, 1052, 'J', ["50-56", "43-49", "36-42", "29-35", "22-28", "15-21", "8-14", "1-7"]),
    ...buildH(100, 1096, 'J', ["106-112", "99-105", "92-98", "85-91", "78-84", "71-77", "64-70", "57-63"]),
    ...buildH(1126, 1052, 'Q', ["1-7", "8-14", "15-21", "22-28"]),
    ...buildH(1126, 1096, 'Q', ["50-56", "43-49", "36-42", "29-35"]),

    // TIER 9
    ...buildH(100, 1188, 'P', ["71-77", "64-70", "57-63", "50-56"]), 
    ...buildH(850, 1188, 'P', ["43-49", "36-42", "29-35", "22-28", "15-21", "8-14", "1-7"]),

    // RAK R
    ...buildV(1550, -150, 'A', [ "71-77", "64-70", "57-63"]),
    ...buildV(1550, 180, 'R', [ "1-4", "5-8", "9-12", "13-16", "17-20", "21-24", "25-28", "29-32", "33-36", "37-40", "41-44"]),
  ];

  const RACK_TITLES = [
    { text: "RAK B", x: 640,  y: -16 },
    { text: "RAK A", x: 1306, y: -16 },
    { text: "RAK D", x: 640,  y: 120 },
    { text: "RAK C", x: 1260, y: 120 },
    { text: "RAK F", x: 640,  y: 256 },
    { text: "RAK F", x: 1306, y: 256 },
    { text: "RAK G", x: 640,  y: 392 },
    { text: "RAK L", x: 140,  y: 624 },
    { text: "RAK K", x: 248,  y: 624 },
    { text: "RAK H", x: 640,  y: 624 },
    { text: "RAK N", x: 1214, y: 624 },
    { text: "RAK M", x: 640,  y: 760 },
    { text: "RAK T", x: 1306, y: 760 },
    { text: "RAK I", x: 640,  y: 896 },
    { text: "RAK W", x: 1306, y: 896 },
    { text: "RAK J", x: 464,  y: 1032 },
    { text: "RAK Q", x: 1306, y: 1032 },
    { text: "RAK P", x: 284,  y: 1168 },
    { text: "RAK P", x: 1168, y: 1168 },
    { text: "RAK A", x: 1568, y: -170 },
    { text: "RAK R", x: 1568, y: 160 },
  ];

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Denah Arsip Utama</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Gunakan tombol zoom atau scroll untuk melihat detail. Klik blok untuk mengelola dokumen.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="flex gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 w-full sm:w-auto justify-center">
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-slate-100 border border-slate-300 rounded-md"></span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-800 rounded-md shadow-sm"></span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Dipilih</span>
                </div>
            </div>
            
            {/* 🔥 Tombol Tambah Box hanya muncul jika role super_admin atau operator */}
            {(user?.role === 'super_admin' || user?.role === 'operator') && (
              <button 
                onClick={() => navigate('/add-box')} 
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
              >
                + Tambah Box
              </button>
            )}
        </div>
      </div>

      <div className="relative p-2 rounded-[2.5rem] bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="absolute bottom-6 right-6 z-20 flex flex-col shadow-lg rounded-xl overflow-hidden border border-slate-200 bg-white">
            <button onClick={handleZoomIn} className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-xl border-b border-slate-100 transition-colors" title="Zoom In">+</button>
            <button onClick={handleResetZoom} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-blue-600 flex items-center justify-center font-bold text-[11px] border-b border-slate-100 transition-colors" title="Reset Zoom">{Math.round(zoom * 100)}%</button>
            <button onClick={handleZoomOut} className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-xl transition-colors" title="Zoom Out">-</button>
        </div>

        <div className="w-full h-[70vh] overflow-auto custom-scrollbar bg-slate-50/30 p-8 relative">
            <div className="relative mx-auto block transition-all duration-300 ease-out" style={{ width: `${1500 * zoom}px`, height: `${1450 * zoom}px` }}>
                <svg viewBox="60 -230 1550 1500" className="w-full h-full drop-shadow-sm">
                {RACK_TITLES.map((title, i) => (
                    <text key={`title-${i}`} x={title.x} y={title.y} textAnchor="middle" className="font-black fill-blue-900 text-[28px] tracking-tight pointer-events-none">{title.text}</text>
                ))}

                {LABELED_RACKS.map((rack, i) => {
                    const isSelected = activeRack?.label === rack.label && activeRack?.prefix === rack.prefix;
                    const midX = rack.x + (rack.w / 2);
                    const midY = rack.y + (rack.h / 2);
                    
                    const labelParts = rack.label.split('-');

                    return (
                        <g key={`labeled-${i}`} onClick={() => { setActiveRack(rack); setSelectedNumber(null); }} className="cursor-pointer group">
                            <rect x={rack.x} y={rack.y} width={rack.w} height={rack.h} rx="4" className={`transition-all duration-200 ${isSelected ? "fill-blue-800 stroke-blue-900 drop-shadow-md" : "fill-slate-100 stroke-slate-300 stroke-[1.5] group-hover:fill-blue-50 group-hover:stroke-blue-400"}`} />
                            
                            {rack.isVert ? (
                                <text
                                    textAnchor="middle"
                                    className={`font-bold transition-colors duration-200 pointer-events-none text-[12px] tracking-tight ${isSelected ? "fill-white" : "fill-slate-700 group-hover:fill-blue-900"}`}
                                >
                                    <tspan x={midX} y={midY - 14}>{labelParts[0]}</tspan>
                                    <tspan x={midX} y={midY + 1}>-</tspan>
                                    <tspan x={midX} y={midY + 16}>{labelParts[1]}</tspan>
                                </text>
                            ) : (
                                <text 
                                    x={midX} 
                                    y={midY + 1} 
                                    textAnchor="middle" 
                                    dominantBaseline="central" 
                                    className={`font-bold transition-colors duration-200 pointer-events-none text-[12px] tracking-tight ${isSelected ? "fill-white" : "fill-slate-700 group-hover:fill-blue-900"}`}
                                >
                                    {rack.label}
                                </text>
                            )}
                        </g>
                    );
                })}
                </svg>
            </div>
        </div>
      </div>

      {activeRack && (
        <RackModal
          rack={activeRack}
          boxes={boxes} 
          selectedNumber={selectedNumber}
          onSelectNumber={setSelectedNumber}
          onClose={() => { setActiveRack(null); setSelectedNumber(null); }}
        />
      )}
    </div>
  );
}