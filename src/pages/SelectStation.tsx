import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { subscribeOcupacao, subscribeLimitesBloco, setLimiteBloco, getPedidosByBloco, type PedidoResumo } from '../services';

type BlocoModal = {
  bloco: number;
  label: string;
  count: number;
  limite: number;
} | null;

export default function SelectStation() {
  const navigate = useNavigate();
  const [ocupacao, setOcupacao] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  });
  const [limites, setLimites] = useState<Record<number, number>>({
    1: 40, 2: 40, 3: 40, 4: 40, 5: 40, 6: 40, 7: 40, 8: 40, 9: 40,
  });

  // Modal state
  const [blocoModal, setBlocoModal] = useState<BlocoModal>(null);
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);
  const [pedidosLoading, setPedidosLoading] = useState(false);
  const [editingLimite, setEditingLimite] = useState(false);
  const [limiteInput, setLimiteInput] = useState('');
  const [savingLimite, setSavingLimite] = useState(false);

  useEffect(() => {
    const unsub1 = subscribeOcupacao(setOcupacao);
    const unsub2 = subscribeLimitesBloco(setLimites);
    return () => { unsub1?.(); unsub2?.(); };
  }, []);

  const openBloco = useCallback(async (bloco: number, label: string) => {
    const count = ocupacao[bloco] || 0;
    const limite = limites[bloco] || 40;
    setBlocoModal({ bloco, label, count, limite });
    setEditingLimite(false);
    setLimiteInput(String(limite));
    setPedidos([]);
    setPedidosLoading(true);
    try {
      const result = await getPedidosByBloco(bloco);
      setPedidos(result);
    } finally {
      setPedidosLoading(false);
    }
  }, [ocupacao, limites]);

  // Keep modal data in sync when ocupacao/limites update
  useEffect(() => {
    if (blocoModal) {
      setBlocoModal((prev) => prev ? {
        ...prev,
        count: ocupacao[prev.bloco] || 0,
        limite: limites[prev.bloco] || 40,
      } : null);
    }
  }, [ocupacao, limites]);

  async function handleSaveLimite() {
    if (!blocoModal) return;
    const val = parseInt(limiteInput, 10);
    if (isNaN(val) || val < 1) return;
    setSavingLimite(true);
    try {
      await setLimiteBloco(blocoModal.bloco, val);
      setEditingLimite(false);
    } finally {
      setSavingLimite(false);
    }
  }

  const ROWS = [
    { rua: 'Rua 1 - Pequenas', blocos: [1, 2, 3] },
    { rua: 'Rua 2 - Médias', blocos: [4, 5, 6] },
    { rua: 'Rua 3 - Grandes', blocos: [7, 8, 9] },
  ];
  const COL_LABELS = ['Coluna A (incompleto)', 'Coluna B (incompleto)', 'Coluna C (completo)'];
  const getBlocoLabel = (rua: string, col: number) =>
    `${rua.replace(' - ', ' – ')} · ${COL_LABELS[col]}`;

  return (
    <div className="page-main">
      <Navbar subtitle="Expedição" />

      <main className="content-wrap" style={{ maxWidth: '640px' }}>
        <div className="page-header" style={{ marginTop: 8 }}>
          <h1>Selecione a estação</h1>
          <p className="subtitle">Cada terminal fica fixo em uma função de operação.</p>
        </div>

        <button id="station-embalagem" className="station-card" onClick={() => navigate('/embalagem')} style={{ padding: '28px' }}>
          <div className="station-icon" style={{ width: '60px', height: '60px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="station-content">
            <div className="station-title" style={{ fontSize: '1.125rem' }}>Estação de Embalagem</div>
            <div className="station-desc" style={{ fontSize: '0.875rem' }}>Registrar onde guardar a caixa recém-embalada</div>
          </div>
          <div className="station-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        <button id="station-saida" className="station-card" onClick={() => navigate('/saida')} style={{ marginTop: 16, padding: '28px' }}>
          <div className="station-icon" style={{ width: '60px', height: '60px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className="station-content">
            <div className="station-title" style={{ fontSize: '1.125rem' }}>Estação de Saída</div>
            <div className="station-desc" style={{ fontSize: '0.875rem' }}>Buscar pedido e liberar posição na coleta</div>
          </div>
          <div className="station-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* Bloco map overview */}
        <div className="card mt-24" style={{ overflowX: 'auto' }}>
          <h2 style={{ marginBottom: 4, fontSize: '1.25rem' }}>Mapa dos blocos</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Clique em um bloco para ver os pedidos e editar a capacidade.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px repeat(3, 1fr)',
            gap: 8,
            fontSize: '0.85rem',
            minWidth: '540px',
          }}>
            {/* Header */}
            <div />
            {COL_LABELS.map((h) => (
              <div key={h} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 0' }}>{h}</div>
            ))}
            {/* Rows */}
            {ROWS.map(({ rua, blocos }) => (
              <React.Fragment key={rua}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', paddingRight: 8, whiteSpace: 'nowrap' }}>
                  {rua}
                </div>
                {blocos.map((b, colIdx) => {
                  const count = ocupacao[b] || 0;
                  const limit = limites[b] || 40;
                  const percentage = Math.min((count / limit) * 100, 100);
                  const isOverLimit = count >= limit;

                  return (
                    <button
                      key={b}
                      id={`bloco-${b}`}
                      onClick={() => openBloco(b, getBlocoLabel(rua, colIdx))}
                      style={{
                        position: 'relative',
                        border: '1.5px solid var(--border-strong)',
                        borderRadius: 8,
                        textAlign: 'center',
                        padding: '12px 6px',
                        fontWeight: 700,
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        backgroundColor: 'var(--surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '68px',
                        cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'border-color 150ms, box-shadow 150ms, transform 150ms',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--wika-blue)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,76,151,0.15)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Progress fill bar */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${percentage}%`,
                        backgroundColor: isOverLimit ? 'rgba(220, 38, 38, 0.15)' : 'rgba(0, 76, 151, 0.1)',
                        borderRight: percentage > 0 ? `2.5px solid ${isOverLimit ? '#dc2626' : 'var(--wika-blue)'}` : 'none',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 0,
                      }} />
                      <span style={{ zIndex: 1, fontWeight: 700, color: 'var(--wika-blue-dark)' }}>Bloco {b}</span>
                      <span style={{ zIndex: 1, fontSize: '0.75rem', fontWeight: 600, color: isOverLimit ? '#dc2626' : 'var(--text-secondary)' }}>
                        {count}/{limit} caixas
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">Sistema de endereçamento - Expedição WIKA</footer>

      {/* ── Modal de detalhes do bloco ─────────────────────────────────────────── */}
      {blocoModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setBlocoModal(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 200ms ease',
          }}
        >
          <div style={{
            background: 'var(--surface)',
            borderRadius: '24px',
            padding: '32px 28px 28px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
            animation: 'slideUp 280ms cubic-bezier(0.34,1.56,0.64,1)',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.375rem' }}>Bloco {blocoModal.bloco}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {blocoModal.label}
                </p>
              </div>
              <button
                onClick={() => setBlocoModal(null)}
                style={{
                  background: 'var(--surface-hover)', border: 'none', borderRadius: '50%',
                  width: 36, height: 36, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Ocupação */}
            <div style={{
              background: 'var(--wika-blue-subtle)',
              border: '1.5px solid var(--wika-blue)',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ocupação</span>
                <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--wika-blue-dark)' }}>
                  {blocoModal.count} / {blocoModal.limite} caixas
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((blocoModal.count / blocoModal.limite) * 100, 100)}%`,
                  background: blocoModal.count >= blocoModal.limite
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : 'linear-gradient(90deg, var(--wika-blue), #0077cc)',
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Editar limite */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Capacidade máxima</span>
                {!editingLimite && (
                  <button
                    id={`editar-limite-${blocoModal.bloco}`}
                    onClick={() => { setEditingLimite(true); setLimiteInput(String(blocoModal.limite)); }}
                    style={{
                      background: 'none', border: '1px solid var(--border-strong)',
                      borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                      fontSize: '0.8125rem', fontWeight: 600, color: 'var(--wika-blue)',
                      display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Editar
                  </button>
                )}
              </div>

              {editingLimite ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id={`input-limite-${blocoModal.bloco}`}
                    type="number"
                    min="1"
                    max="999"
                    value={limiteInput}
                    onChange={(e) => setLimiteInput(e.target.value)}
                    autoFocus
                    style={{ flex: 1, fontSize: '1rem', fontWeight: 700, textAlign: 'center' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLimite(); if (e.key === 'Escape') setEditingLimite(false); }}
                  />
                  <button
                    onClick={handleSaveLimite}
                    disabled={savingLimite}
                    className="btn btn-primary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {savingLimite ? <><span className="spinner" />Salvando</> : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setEditingLimite(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--surface-alt)',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}>
                  {blocoModal.limite} caixas
                </div>
              )}
            </div>

            {/* Pedidos */}
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Pedidos neste bloco
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              {pedidosLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                  <span className="spinner spinner-blue" style={{ width: 24, height: 24, borderWidth: 2.5 }} />
                </div>
              ) : pedidos.length === 0 ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  background: 'var(--surface-alt)',
                  borderRadius: 10,
                  border: '1px dashed var(--border-strong)',
                }}>
                  Nenhum pedido neste bloco
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pedidos.map(({ pedido, caixas }) => (
                    <div key={pedido} style={{
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                      {/* Pedido header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'var(--surface-alt)',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--wika-blue-dark)' }}>
                          {pedido}
                        </span>
                        <span className="badge badge-blue">{caixas.length} caixa{caixas.length !== 1 ? 's' : ''}</span>
                      </div>
                      {/* Caixas */}
                      {caixas.map((c, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 14px',
                          fontSize: '0.8125rem',
                          borderBottom: i < caixas.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{c.caixa}</span>
                            {c.codigoItem && <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>· {c.codigoItem}</span>}
                          </div>
                          <span style={{ fontWeight: 700, color: 'var(--wika-blue)', whiteSpace: 'nowrap' }}>
                            Pos. {String(c.posicao).padStart(3, '0')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
