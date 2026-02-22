
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { PieceRequest, CoilConfig, PackingResult } from './types';
import { calculatePlanoDeCorte } from './services/packer';

const INITIAL_PIECES: PieceRequest[] = [
  { id: '1', height: 120, width: 60, quantity: 2 },
  { id: '2', height: 80, width: 40, quantity: 4 },
  { id: '3', height: 200, width: 50, quantity: 1 },
];

const PIECE_COLORS = [
  { bg: 'rgba(31,173,173,0.2)', border: 'rgba(31,173,173,0.65)', label: '#1fadad', tag: 'rgba(31,173,173,0.15)' },
  { bg: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.65)', label: '#8b5cf6', tag: 'rgba(139,92,246,0.15)' },
  { bg: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.65)', label: '#f97316', tag: 'rgba(249,115,22,0.15)' },
  { bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.65)', label: '#10b981', tag: 'rgba(16,185,129,0.15)' },
  { bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.65)', label: '#ef4444', tag: 'rgba(239,68,68,0.15)' },
  { bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.65)', label: '#3b82f6', tag: 'rgba(59,130,246,0.15)' },
  { bg: 'rgba(245,158,11,0.2)', border: 'rgba(245,158,11,0.65)', label: '#f59e0b', tag: 'rgba(245,158,11,0.15)' },
  { bg: 'rgba(236,72,153,0.2)', border: 'rgba(236,72,153,0.65)', label: '#ec4899', tag: 'rgba(236,72,153,0.15)' },
];

const MATERIAL_LABELS: Record<string, string> = {
  ppf: 'PPF (Paint Protection)',
  tint: 'Insulfilm (Window Tint)',
  wrap: 'Vinil Wrap',
};

const App: React.FC = () => {
  const [pieces, setPieces] = useState<PieceRequest[]>(INITIAL_PIECES);
  const [coil, setCoil] = useState<CoilConfig>({
    materialType: 'ppf',
    width: 1.52,
    length: 30.00,
    safetyMargin: 2,
  });
  const [packingResult, setPackingResult] = useState<PackingResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasSectionRef = useRef<HTMLElement>(null);

  const handleCalculate = useCallback(() => {
    const result = calculatePlanoDeCorte(pieces, coil.width, coil.safetyMargin);
    setPackingResult(result);
  }, [pieces, coil]);

  useEffect(() => {
    handleCalculate();
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [handleCalculate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasSectionRef.current?.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const addPiece = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setPieces(prev => [...prev, { id: newId, height: 100, width: 50, quantity: 1 }]);
  };

  const updatePiece = (id: string, field: keyof PieceRequest, value: number) => {
    setPieces(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePiece = (id: string) => {
    setPieces(prev => prev.filter(p => p.id !== id));
  };

  const clearPieces = () => setPieces([]);

  const PX_PER_CM = 2.5;
  const totalPiecesCount = pieces.reduce((s, p) => s + p.quantity, 0);
  const efficiency = packingResult?.efficiency ?? 0;
  const efficiencyColor = efficiency >= 80 ? '#1fadad' : efficiency >= 55 ? '#f59e0b' : '#ef4444';

  const pieceColorMap = useMemo(() => {
    const map: Record<string, typeof PIECE_COLORS[0]> = {};
    pieces.forEach((p, i) => {
      map[p.id] = PIECE_COLORS[i % PIECE_COLORS.length];
    });
    return map;
  }, [pieces]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark">

      {/* ─── Header ─── */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-border-dark bg-background-dark shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1fadad 0%, #0f8080 100%)',
              boxShadow: '0 0 18px rgba(31,173,173,0.4)',
            }}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ color: '#071010', fontVariationSettings: "'FILL' 1" }}
            >
              content_cut
            </span>
          </div>
          <div>
            <h1 className="text-white text-sm font-bold leading-none tracking-tight">Plano de Corte Pro</h1>
            <p className="text-text-muted text-[10px] mt-0.5 leading-none">Otimização de corte de bobinas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-8 px-3.5 items-center gap-1.5 rounded-lg border border-border-dark bg-surface-dark text-text-muted hover:text-white hover:border-input-border text-xs font-medium transition-all">
            <span className="material-symbols-outlined text-[15px]">picture_as_pdf</span>
            Exportar PDF
          </button>
          <button
            className="flex h-8 px-3.5 items-center gap-1.5 rounded-lg text-[#071010] text-xs font-bold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #1fadad 0%, #13a0a0 100%)',
              boxShadow: '0 2px 10px rgba(31,173,173,0.35)',
            }}
          >
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            Salvar Projeto
          </button>
          <div className="w-px h-6 bg-border-dark mx-1" />
          <button title="Compartilhar" className="size-8 flex items-center justify-center rounded-lg border border-border-dark bg-surface-dark text-text-muted hover:text-white hover:border-input-border transition-all">
            <span className="material-symbols-outlined text-[17px]">share</span>
          </button>
          <button title="Ajuda" className="size-8 flex items-center justify-center rounded-lg border border-border-dark bg-surface-dark text-text-muted hover:text-white hover:border-input-border transition-all">
            <span className="material-symbols-outlined text-[17px]">help_outline</span>
          </button>
          <button title="Conta" className="size-8 flex items-center justify-center rounded-lg border border-border-dark bg-surface-dark text-text-muted hover:text-white hover:border-input-border transition-all">
            <span className="material-symbols-outlined text-[17px]">account_circle</span>
          </button>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">

        {/* ─── Coil Config Bar ─── */}
        <section className="bg-surface-dark rounded-xl border border-border-dark shrink-0 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">

            {/* Left: controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>roller</span>
                </div>
                <span className="text-white text-xs font-bold">Bobina</span>
              </div>

              <div className="h-5 w-px bg-border-dark hidden md:block" />

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Material</label>
                  <select
                    className="h-8 rounded-lg bg-background-dark border border-input-border text-white text-xs px-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                    value={coil.materialType}
                    onChange={e => setCoil({ ...coil, materialType: e.target.value })}
                  >
                    {Object.entries(MATERIAL_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 w-24">
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Largura (m)</label>
                  <input
                    className="h-8 w-full rounded-lg bg-background-dark border border-input-border text-white text-xs px-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    step="0.01" type="number"
                    value={coil.width}
                    onChange={e => setCoil({ ...coil, width: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex flex-col gap-1 w-28">
                  <label className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Comprimento (m)</label>
                  <input
                    className="h-8 w-full rounded-lg bg-background-dark border border-input-border text-white text-xs px-2.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    type="number"
                    value={coil.length}
                    onChange={e => setCoil({ ...coil, length: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Quick presets */}
              <div className="hidden xl:flex items-center gap-1.5">
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mr-0.5">Presets:</span>
                {[0.60, 1.00, 1.52, 1.82].map(w => (
                  <button
                    key={w}
                    onClick={() => setCoil({ ...coil, width: w })}
                    className={`h-6 px-2.5 rounded-full border text-[11px] font-medium transition-all ${coil.width === w
                      ? 'border-primary/60 text-primary bg-primary/10 shadow-[0_0_8px_rgba(31,173,173,0.2)]'
                      : 'border-border-dark text-text-muted hover:border-input-border hover:text-white bg-transparent'}`}
                  >
                    {w.toFixed(2)}m
                  </button>
                ))}
              </div>
            </div>

            {/* Right: margin + area */}
            <div className="flex items-center gap-3">
              {/* Safety margin toggle */}
              <div className="flex items-center gap-2.5 bg-background-dark px-3 py-2 rounded-lg border border-border-dark">
                <button
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setCoil({ ...coil, safetyMargin: coil.safetyMargin > 0 ? 0 : 2 })}
                >
                  <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${coil.safetyMargin > 0 ? 'bg-primary/30' : 'bg-border-dark'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${coil.safetyMargin > 0 ? 'right-0.5 bg-primary' : 'left-0.5 bg-text-muted'}`} />
                  </div>
                  <span className="text-xs font-medium text-white whitespace-nowrap">Margem</span>
                </button>
                <div className="w-px h-4 bg-border-dark" />
                <div className="flex items-center gap-1">
                  <input
                    className="w-8 bg-transparent border-none text-right text-xs text-white p-0 focus:ring-0 font-bold"
                    type="number"
                    value={coil.safetyMargin}
                    onChange={e => setCoil({ ...coil, safetyMargin: parseInt(e.target.value) || 0 })}
                  />
                  <span className="text-[10px] text-text-muted">cm</span>
                </div>
              </div>

              {/* Total area */}
              <div className="flex flex-col items-end px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5">
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Área Total</span>
                <span className="text-lg font-bold text-white leading-none mt-0.5">
                  {(coil.width * coil.length).toFixed(1)}
                  <span className="text-xs text-text-muted font-normal ml-1">m²</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Workspace ─── */}
        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">

          {/* ─── Sidebar ─── */}
          <aside className="w-72 bg-surface-dark rounded-xl border border-border-dark flex flex-col shrink-0">
            {/* Sidebar header */}
            <div className="px-4 py-3 border-b border-border-dark flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-bold">Lista de Peças</span>
                {totalPiecesCount > 0 && (
                  <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-primary/25">
                    {totalPiecesCount} pç
                  </span>
                )}
              </div>
              <button className="size-7 flex items-center justify-center rounded-lg text-text-muted hover:text-white hover:bg-background-dark transition-all">
                <span className="material-symbols-outlined text-[17px]">more_horiz</span>
              </button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[18px_1fr_1fr_40px_24px] gap-1.5 px-4 py-2 bg-background-dark/50 border-b border-border-dark text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              <div />
              <div>Alt (cm)</div>
              <div>Larg (cm)</div>
              <div className="text-center">Qtd</div>
              <div />
            </div>

            {/* Piece rows */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {pieces.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-text-muted">
                  <span className="material-symbols-outlined text-3xl opacity-30">inventory_2</span>
                  <p className="text-xs text-center leading-relaxed opacity-60">Nenhuma peça adicionada.<br />Clique em "+" para começar.</p>
                </div>
              ) : (
                pieces.map((piece, index) => {
                  const color = PIECE_COLORS[index % PIECE_COLORS.length];
                  return (
                    <div
                      key={piece.id}
                      className="grid grid-cols-[18px_1fr_1fr_40px_24px] gap-1.5 items-center px-2 py-1.5 rounded-lg hover:bg-background-dark/60 group transition-all"
                    >
                      <div
                        className="size-3.5 rounded-sm shrink-0 border"
                        style={{ background: color.bg, borderColor: color.border }}
                      />
                      <input
                        className="h-7 w-full rounded bg-background-dark border border-transparent hover:border-input-border focus:border-primary text-white text-xs px-2 outline-none transition-colors"
                        type="number"
                        value={piece.height}
                        onChange={e => updatePiece(piece.id, 'height', parseInt(e.target.value) || 0)}
                      />
                      <input
                        className="h-7 w-full rounded bg-background-dark border border-transparent hover:border-input-border focus:border-primary text-white text-xs px-2 outline-none transition-colors"
                        type="number"
                        value={piece.width}
                        onChange={e => updatePiece(piece.id, 'width', parseInt(e.target.value) || 0)}
                      />
                      <input
                        className="h-7 w-full rounded bg-background-dark border border-transparent hover:border-input-border focus:border-primary text-white text-xs px-2 text-center outline-none transition-colors"
                        type="number"
                        value={piece.quantity}
                        onChange={e => updatePiece(piece.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <button
                        onClick={() => removePiece(piece.id)}
                        className="flex items-center justify-center text-transparent group-hover:text-text-muted hover:!text-red-400 transition-all"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                  );
                })
              )}

              <button
                onClick={addPiece}
                className="w-full h-8 mt-1 rounded-lg border border-dashed border-border-dark text-text-muted text-xs font-medium hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                Adicionar peça
              </button>
            </div>

            {/* Footer actions */}
            <div className="p-3 border-t border-border-dark space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button className="h-8 rounded-lg border border-border-dark text-text-muted text-[11px] font-medium hover:bg-background-dark hover:text-white transition-all flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">upload_file</span>
                  Importar
                </button>
                <button
                  onClick={clearPieces}
                  className="h-8 rounded-lg border border-border-dark text-text-muted text-[11px] font-medium hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                  Limpar
                </button>
              </div>
              <button
                onClick={handleCalculate}
                className="btn-generate w-full h-10 rounded-xl text-[#071010] text-sm font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #1fadad 0%, #13a0a0 100%)',
                }}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Gerar Plano de Corte
              </button>
            </div>
          </aside>

          {/* ─── Canvas ─── */}
          <section
            ref={canvasSectionRef}
            className={`flex-1 bg-surface-dark rounded-xl border border-border-dark relative flex flex-col overflow-hidden transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
          >
            {/* Floating toolbar */}
            <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start pointer-events-none">
              <div className="bg-background-dark/85 backdrop-blur-md px-3 py-2 rounded-lg border border-border-dark/80 pointer-events-auto shadow-xl">
                <h4 className="text-white text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                  Mesa de Corte
                  <span className="text-[10px] font-normal text-text-muted bg-background-dark/70 px-1.5 py-0.5 rounded border border-border-dark/50">
                    1:{PX_PER_CM} cm/px
                  </span>
                </h4>
              </div>

              <div className="bg-background-dark/85 backdrop-blur-md p-1 rounded-lg border border-border-dark/80 pointer-events-auto flex items-center gap-0.5 shadow-xl">
                <button title="Grade" className="size-8 flex items-center justify-center rounded hover:bg-surface-dark text-text-muted hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[17px]">grid_view</span>
                </button>
                <button title="Girar Peças" className="size-8 flex items-center justify-center rounded hover:bg-surface-dark text-text-muted hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[17px]">rotate_90_degrees_cw</span>
                </button>
                <div className="w-px h-5 bg-border-dark mx-0.5" />
                <button title="Desfazer" disabled className="size-8 flex items-center justify-center rounded text-text-muted/30 cursor-not-allowed">
                  <span className="material-symbols-outlined text-[17px]">undo</span>
                </button>
                <button title="Refazer" disabled className="size-8 flex items-center justify-center rounded text-text-muted/30 cursor-not-allowed">
                  <span className="material-symbols-outlined text-[17px]">redo</span>
                </button>
                <div className="w-px h-5 bg-border-dark mx-0.5" />
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
                  className={`size-8 flex items-center justify-center rounded transition-all hover:bg-surface-dark ${isFullscreen ? 'text-primary' : 'text-text-muted hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-[19px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                </button>
              </div>
            </div>

            {/* Canvas area */}
            <div className="flex-1 relative overflow-auto grid-bg cursor-grab active:cursor-grabbing p-16">
              {(!packingResult || packingResult.placedPieces.length === 0) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none select-none">
                  <div className="size-14 rounded-2xl border border-border-dark bg-surface-dark/80 flex items-center justify-center opacity-40">
                    <span className="material-symbols-outlined text-3xl text-text-muted">design_services</span>
                  </div>
                  <p className="text-text-muted text-sm font-medium opacity-60">Nenhum plano gerado ainda</p>
                  <p className="text-text-muted text-xs opacity-40">Adicione peças e clique em "Gerar Plano de Corte"</p>
                </div>
              ) : (
                <div
                  className="relative mx-auto border-y-2 border-dashed border-input-border/50 shadow-2xl"
                  style={{
                    background: 'linear-gradient(180deg, #0d1414 0%, #111616 100%)',
                    width: `${(packingResult.totalLengthUsed) * 100 * PX_PER_CM}px`,
                    height: `${coil.width * 100 * PX_PER_CM}px`,
                    minWidth: '300px',
                    minHeight: '150px',
                    boxShadow: '0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(42,55,55,0.4)',
                  }}
                >
                  {/* Width label */}
                  <div className="absolute -left-11 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-text-muted font-mono whitespace-nowrap">
                    {coil.width.toFixed(2)}m
                  </div>

                  {/* Safety margin guides */}
                  {coil.safetyMargin > 0 && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        top: `${coil.safetyMargin * PX_PER_CM}px`,
                        bottom: `${coil.safetyMargin * PX_PER_CM}px`,
                        left: 0, right: 0,
                        borderTop: '1px dashed rgba(239,68,68,0.3)',
                        borderBottom: '1px dashed rgba(239,68,68,0.3)',
                      }}
                    />
                  )}

                  {/* Placed pieces */}
                  {packingResult.placedPieces.map(piece => {
                    const color = pieceColorMap[piece.originalId] || PIECE_COLORS[0];
                    return (
                      <div
                        key={piece.id}
                        className="absolute cursor-pointer group rounded-sm transition-all duration-100 piece-anim"
                        title={`${piece.width} × ${piece.height} cm`}
                        style={{
                          left: `${piece.y * PX_PER_CM}px`,
                          top: `${piece.x * PX_PER_CM}px`,
                          width: `${piece.height * PX_PER_CM}px`,
                          height: `${piece.width * PX_PER_CM}px`,
                          background: color.bg,
                          border: `1px solid ${color.border}`,
                        }}
                      >
                        <div
                          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold opacity-40 group-hover:opacity-100 select-none overflow-hidden text-center p-1 transition-opacity leading-tight"
                          style={{ color: color.label }}
                        >
                          {piece.height}×{piece.width}
                        </div>
                        <div
                          className="absolute top-0.5 right-0.5 text-[8px] font-bold px-1 rounded leading-tight"
                          style={{
                            background: color.tag,
                            color: color.label,
                            border: `1px solid ${color.border}`,
                          }}
                        >
                          #{piece.id.split('-')[0]}
                        </div>
                      </div>
                    );
                  })}

                  {/* Length ruler */}
                  <div className="absolute -bottom-9 left-0 right-0 flex justify-between items-start text-[10px] text-text-muted px-1 pt-1.5">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-px h-2 bg-text-muted/40" />
                      <span>0m</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-px h-2 bg-text-muted/40" />
                      <span>{packingResult.totalLengthUsed.toFixed(2)}m</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Stats Footer ─── */}
            <div className={`border-t border-border-dark px-5 py-3 flex items-center justify-between bg-background-dark/90 backdrop-blur-md z-20 ${isFullscreen ? 'px-10' : ''}`}>
              <div className="flex items-center gap-5">

                {/* Efficiency */}
                <div>
                  <div className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-1.5">Aproveitamento</div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-bold leading-none" style={{ color: efficiencyColor }}>
                      {packingResult?.efficiency.toFixed(1)}%
                    </span>
                    <div className="w-20 h-1.5 bg-background-dark rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${packingResult?.efficiency ?? 0}%`,
                          background: efficiencyColor,
                          boxShadow: `0 0 6px ${efficiencyColor}70`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-px h-8 bg-border-dark" />

                {/* Waste */}
                <div>
                  <div className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-1.5">Desperdício</div>
                  <span className="text-xl font-bold leading-none text-white">
                    {packingResult?.wasteArea.toFixed(2)}
                    <span className="text-xs text-text-muted font-normal ml-1">m²</span>
                  </span>
                </div>

                <div className="w-px h-8 bg-border-dark" />

                {/* Length used */}
                <div>
                  <div className="text-[10px] text-text-muted uppercase font-semibold tracking-wider mb-1.5">Comprimento Usado</div>
                  <span className="text-xl font-bold leading-none text-white">
                    {packingResult?.totalLengthUsed.toFixed(2)}
                    <span className="text-xs text-text-muted font-normal ml-1">m</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {coil.safetyMargin > 0 && (
                  <div className="flex items-center gap-1.5 bg-surface-dark/80 border border-border-dark px-3 py-1.5 rounded-lg text-text-muted text-xs">
                    <span className="material-symbols-outlined text-primary text-[13px]">straighten</span>
                    Margem: {coil.safetyMargin}cm
                  </div>
                )}
                {isFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="h-8 px-4 rounded-lg border border-border-dark bg-surface-dark text-white text-xs font-bold hover:bg-border-dark transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[15px]">fullscreen_exit</span>
                    Sair
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
