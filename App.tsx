
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { PieceRequest, CoilConfig, PackingResult, PlacedPiece } from './types';
import { calculatePlanoDeCorte } from './services/packer';

const INITIAL_PIECES: PieceRequest[] = [
  { id: '1', height: 120, width: 60, quantity: 2 },
  { id: '2', height: 80, width: 40, quantity: 4 },
  { id: '3', height: 200, width: 50, quantity: 1 },
];

const App: React.FC = () => {
  const [pieces, setPieces] = useState<PieceRequest[]>(INITIAL_PIECES);
  const [coil, setCoil] = useState<CoilConfig>({
    materialType: 'ppf',
    width: 1.52,
    length: 30.00,
    safetyMargin: 2
  });
  const [packingResult, setPackingResult] = useState<PackingResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const canvasSectionRef = useRef<HTMLElement>(null);

  const handleCalculate = useCallback(() => {
    const result = calculatePlanoDeCorte(pieces, coil.width, coil.safetyMargin);
    setPackingResult(result);
  }, [pieces, coil]);

  // Initial calculation
  useEffect(() => {
    handleCalculate();
    
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [handleCalculate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasSectionRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const addPiece = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setPieces([...pieces, { id: newId, height: 100, width: 50, quantity: 1 }]);
  };

  const updatePiece = (id: string, field: keyof PieceRequest, value: number) => {
    setPieces(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePiece = (id: string) => {
    setPieces(prev => prev.filter(p => p.id !== id));
  };

  const clearPieces = () => setPieces([]);

  // Visualization constants
  const PX_PER_CM = 2.5; // Scale for canvas rendering

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-6 py-3 bg-background-dark shrink-0 z-20">
        <div className="flex items-center gap-4 text-white">
          <div className="size-8 bg-surface-dark rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">content_cut</span>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Plano de Corte Pro</h2>
        </div>
        <div className="flex gap-3">
          <button className="flex h-10 px-4 items-center justify-center rounded-lg bg-surface-dark border border-transparent hover:border-input-border text-white text-sm font-bold transition-all">
            <span>Exportar PDF</span>
          </button>
          <button className="flex h-10 px-4 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-[#121717] text-sm font-bold transition-all">
            <span>Salvar Projeto</span>
          </button>
          <div className="h-10 w-[1px] bg-border-dark mx-1"></div>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-dark hover:bg-border-dark text-white"><span className="material-symbols-outlined text-[20px]">share</span></button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-dark hover:bg-border-dark text-white"><span className="material-symbols-outlined text-[20px]">help</span></button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-dark hover:bg-border-dark text-white"><span className="material-symbols-outlined text-[20px]">account_circle</span></button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        
        {/* Coil Config */}
        <section className="bg-surface-dark rounded-xl border border-border-dark shadow-sm shrink-0 flex flex-wrap items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings_applications</span>
              <h3 className="text-white text-base font-bold">Bobina</h3>
            </div>
            <div className="h-8 w-[1px] bg-border-dark hidden md:block"></div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <label className="text-xs text-text-muted mb-1 font-medium">Tipo de Material</label>
                <select 
                  className="h-9 rounded-lg bg-background-dark border border-input-border text-white text-sm px-3 py-1 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  value={coil.materialType}
                  onChange={e => setCoil({ ...coil, materialType: e.target.value })}
                >
                  <option value="ppf">PPF (Paint Protection)</option>
                  <option value="tint">Insulfilm (Window Tint)</option>
                  <option value="wrap">Vinil Wrap</option>
                </select>
              </div>
              <div className="flex flex-col w-28">
                <label className="text-xs text-text-muted mb-1 font-medium">Largura (m)</label>
                <input 
                  className="h-9 rounded-lg bg-background-dark border border-input-border text-white text-sm px-3 py-1 focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  step="0.01" type="number" 
                  value={coil.width}
                  onChange={e => setCoil({ ...coil, width: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex flex-col w-28">
                <label className="text-xs text-text-muted mb-1 font-medium">Comprimento (m)</label>
                <input 
                  className="h-9 rounded-lg bg-background-dark border border-input-border text-white text-sm px-3 py-1 focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                  type="number" 
                  value={coil.length}
                  onChange={e => setCoil({ ...coil, length: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-2">
              {[0.60, 1.00, 1.52, 1.82].map(w => (
                <button 
                  key={w}
                  onClick={() => setCoil({ ...coil, width: w })}
                  className={`h-7 px-3 rounded-full border text-xs transition-all ${coil.width === w ? 'bg-background-dark border-primary text-primary font-bold shadow-[0_0_10px_rgba(31,173,173,0.2)]' : 'bg-background-dark border-border-dark text-text-muted hover:text-white hover:border-primary'}`}
                >
                  {w.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-background-dark px-3 py-2 rounded-lg border border-border-dark">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCoil({ ...coil, safetyMargin: coil.safetyMargin > 0 ? 0 : 2 })}>
                <div className={`w-9 h-5 rounded-full relative p-0.5 transition-colors ${coil.safetyMargin > 0 ? 'bg-primary/20' : 'bg-surface-dark'}`}>
                  <div className={`w-4 h-4 rounded-full bg-primary shadow-sm absolute transition-all ${coil.safetyMargin > 0 ? 'right-0.5' : 'left-0.5'} top-0.5`}></div>
                </div>
                <span className="text-xs font-medium text-white">Sobra</span>
              </div>
              <div className="h-4 w-[1px] bg-border-dark"></div>
              <input 
                className="w-12 bg-transparent border-none text-right text-xs text-white p-0 focus:ring-0 font-medium" 
                type="number" 
                value={coil.safetyMargin}
                onChange={e => setCoil({ ...coil, safetyMargin: parseInt(e.target.value) || 0 })}
              />
              <span className="text-[10px] text-text-muted">cm</span>
            </div>
            <div className="flex flex-col items-end min-w-[120px]">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Área Total</span>
              <span className="text-lg font-bold text-white leading-none mt-1">{(coil.width * coil.length).toFixed(1)} m²</span>
            </div>
          </div>
        </section>

        {/* Workspace Columns */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
          {/* Sidebar - List of Pieces */}
          <aside className="w-80 bg-surface-dark rounded-xl border border-border-dark shadow-sm flex flex-col shrink-0 transition-all duration-300">
            <div className="p-4 border-b border-border-dark flex justify-between items-center">
              <h3 className="text-white font-bold">Lista de Peças</h3>
              <button className="text-text-muted hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">more_horiz</span></button>
            </div>
            <div className="grid grid-cols-[1fr_1fr_0.8fr_30px] gap-2 px-4 py-2 bg-background-dark/50 border-b border-border-dark text-xs font-medium text-text-muted uppercase">
              <div>Alt (cm)</div>
              <div>Larg (cm)</div>
              <div className="text-center">Qtd</div>
              <div></div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {pieces.map(piece => (
                <div key={piece.id} className="grid grid-cols-[1fr_1fr_0.8fr_30px] gap-2 items-center p-2 rounded-lg hover:bg-background-dark group">
                  <input 
                    className="h-8 w-full rounded bg-background-dark border border-input-border text-white text-sm px-2 focus:border-primary outline-none" 
                    type="number" 
                    value={piece.height} 
                    onChange={e => updatePiece(piece.id, 'height', parseInt(e.target.value) || 0)}
                  />
                  <input 
                    className="h-8 w-full rounded bg-background-dark border border-input-border text-white text-sm px-2 focus:border-primary outline-none" 
                    type="number" 
                    value={piece.width} 
                    onChange={e => updatePiece(piece.id, 'width', parseInt(e.target.value) || 0)}
                  />
                  <input 
                    className="h-8 w-full rounded bg-background-dark border border-input-border text-white text-sm px-2 text-center focus:border-primary outline-none" 
                    type="number" 
                    value={piece.quantity} 
                    onChange={e => updatePiece(piece.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                  <button 
                    onClick={() => removePiece(piece.id)}
                    className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
              <button 
                onClick={addPiece}
                className="w-full h-9 mt-2 rounded-lg border border-dashed border-input-border text-text-muted text-sm hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Adicionar medida
              </button>
            </div>
            <div className="p-4 border-t border-border-dark space-y-3 bg-background-dark/30">
              <div className="grid grid-cols-2 gap-3">
                <button className="h-9 px-3 rounded-lg border border-input-border text-white text-xs font-medium hover:bg-border-dark transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Importar
                </button>
                <button 
                  onClick={clearPieces}
                  className="h-9 px-3 rounded-lg border border-input-border text-white text-xs font-medium hover:bg-border-dark hover:text-red-300 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  Limpar
                </button>
              </div>
              <button 
                onClick={handleCalculate}
                className="w-full h-11 rounded-lg bg-primary hover:bg-primary-hover text-[#121717] text-sm font-bold shadow-[0_4px_12px_rgba(31,173,173,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                Gerar plano de corte
              </button>
            </div>
          </aside>

          {/* Main Canvas Visualization */}
          <section 
            ref={canvasSectionRef}
            className={`flex-1 bg-surface-dark rounded-xl border border-border-dark shadow-sm relative flex flex-col overflow-hidden transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
          >
            {/* Toolbar Overlay */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
              <div className="bg-surface-dark/90 backdrop-blur-md px-4 py-2 rounded-lg border border-border-dark pointer-events-auto shadow-lg">
                <h4 className="text-white text-sm font-bold flex items-center gap-2">
                  Mesa de Corte
                  <span className="text-xs font-normal text-text-muted bg-background-dark px-2 py-0.5 rounded border border-border-dark">Escala 1:{PX_PER_CM.toFixed(1)}</span>
                </h4>
              </div>
              <div className="bg-surface-dark/90 backdrop-blur-md p-1 rounded-lg border border-border-dark pointer-events-auto flex gap-1 shadow-lg">
                <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-background-dark text-white" title="Grade"><span className="material-symbols-outlined text-[20px]">grid_view</span></button>
                <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-background-dark text-white" title="Girar Peças"><span className="material-symbols-outlined text-[20px]">rotate_90_degrees_cw</span></button>
                <div className="w-[1px] h-6 bg-border-dark my-auto mx-1"></div>
                <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-background-dark text-white disabled:opacity-50" title="Desfazer"><span className="material-symbols-outlined text-[20px]">undo</span></button>
                <button className="w-9 h-9 flex items-center justify-center rounded hover:bg-background-dark text-white disabled:opacity-50" title="Refazer"><span className="material-symbols-outlined text-[20px]">redo</span></button>
                <div className="w-[1px] h-6 bg-border-dark my-auto mx-1"></div>
                <button 
                  onClick={toggleFullscreen}
                  className={`w-9 h-9 flex items-center justify-center rounded hover:bg-background-dark ${isFullscreen ? 'text-primary' : 'text-white'}`}
                  title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                >
                  <span className="material-symbols-outlined text-[22px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                </button>
              </div>
            </div>

            {/* Actual Canvas */}
            <div className="flex-1 relative overflow-auto grid-bg cursor-grab active:cursor-grabbing p-16">
              <div 
                className="bg-[#121717] border-y-2 border-dashed border-input-border relative shadow-2xl transition-all mx-auto"
                style={{
                  width: `${(packingResult?.totalLengthUsed || 0) * 100 * PX_PER_CM}px`,
                  height: `${coil.width * 100 * PX_PER_CM}px`,
                  minWidth: '300px',
                  minHeight: '150px'
                }}
              >
                {/* Ruler Markings */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-text-muted font-mono whitespace-nowrap">
                  {coil.width.toFixed(2)}m
                </div>

                {/* Safety Margins (Visual) */}
                {coil.safetyMargin > 0 && (
                  <div 
                    className="absolute border-y border-red-500/10 bg-red-500/5 pointer-events-none"
                    style={{
                      top: `${coil.safetyMargin * PX_PER_CM}px`,
                      bottom: `${coil.safetyMargin * PX_PER_CM}px`,
                      left: 0,
                      right: 0
                    }}
                  />
                )}

                {/* Placed Pieces */}
                {packingResult?.placedPieces.map(piece => (
                  <div 
                    key={piece.id}
                    className="absolute bg-primary/20 border border-primary/60 hover:border-primary hover:bg-primary/30 cursor-pointer group rounded-sm transition-all"
                    title={`${piece.width} x ${piece.height} cm`}
                    style={{
                      left: `${piece.y * PX_PER_CM}px`,
                      top: `${piece.x * PX_PER_CM}px`,
                      width: `${piece.height * PX_PER_CM}px`,
                      height: `${piece.width * PX_PER_CM}px`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-40 group-hover:opacity-100 select-none overflow-hidden text-center p-1 transition-opacity">
                      {piece.height}×{piece.width}
                    </div>
                    <div className="absolute top-0.5 right-0.5 bg-primary text-[#121717] text-[8px] font-bold px-1 rounded leading-tight shadow-sm opacity-80">
                      #{piece.id.split('-')[0]}
                    </div>
                  </div>
                ))}

                {/* Length Ruler */}
                <div className="absolute -bottom-10 left-0 right-0 h-6 flex justify-between items-center text-[10px] text-text-muted px-2 border-t border-border-dark/30 pt-1">
                  <div className="flex flex-col items-center">
                    <div className="w-[1px] h-2 bg-text-muted mb-1"></div>
                    <span>0m</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[1px] h-2 bg-text-muted mb-1"></div>
                    <span>{(packingResult?.totalLengthUsed || 0).toFixed(2)}m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Stats Overlay */}
            <div className={`bg-background-dark/95 backdrop-blur border-t border-border-dark px-6 py-4 flex justify-between items-center text-sm z-20 transition-all ${isFullscreen ? 'px-12' : ''}`}>
              <div className="flex gap-12">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Aproveitamento</span>
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-bold text-xl">{packingResult?.efficiency.toFixed(1)}%</span>
                    <div className="w-24 h-2 bg-surface-dark rounded-full overflow-hidden border border-border-dark">
                      <div className="h-full bg-primary shadow-[0_0_10px_rgba(31,173,173,0.5)] transition-all duration-1000" style={{ width: `${packingResult?.efficiency}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Desperdício</span>
                  <span className="text-white font-bold text-xl">{packingResult?.wasteArea.toFixed(2)} m²</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-1">Comprimento Usado</span>
                  <span className="text-white font-bold text-xl">{packingResult?.totalLengthUsed.toFixed(2)} m</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-text-muted text-xs bg-surface-dark/50 px-3 py-1.5 rounded-full border border-border-dark">
                  <span className="material-symbols-outlined text-sm text-primary">info</span>
                  <span>Inclui margem de {coil.safetyMargin}cm</span>
                </div>
                {isFullscreen && (
                   <button 
                    onClick={toggleFullscreen}
                    className="h-10 px-4 rounded-lg bg-surface-dark border border-input-border text-white text-xs font-bold hover:bg-border-dark transition-all"
                  >
                    Sair da Tela Cheia
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
