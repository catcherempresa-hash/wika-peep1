import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { subscribeOcupacao } from '../services';

export default function SelectStation() {
  const navigate = useNavigate();
  const [ocupacao, setOcupacao] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  });

  useEffect(() => {
    const unsub = subscribeOcupacao(setOcupacao);
    return unsub;
  }, []);

  return (
    <div className="page-main">
      <Navbar subtitle="Expedição" />

      <main className="content-wrap" style={{ maxWidth: '640px' }}>
        <div className="page-header" style={{ marginTop: 8 }}>
          <h1>Selecione a estação</h1>
          <p className="subtitle">Cada terminal fica fixo em uma função de operação.</p>
        </div>

        <button
          id="station-embalagem"
          className="station-card"
          onClick={() => navigate('/embalagem')}
          style={{ padding: '28px' }}
        >
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

        <button
          id="station-saida"
          className="station-card"
          onClick={() => navigate('/saida')}
          style={{ marginTop: 16, padding: '28px' }}
        >
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
          <h2 style={{ marginBottom: 16, fontSize: '1.25rem' }}>Mapa dos blocos</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px repeat(3, 1fr)',
            gap: 8,
            fontSize: '0.85rem',
            minWidth: '540px',
          }}>
            {/* Header */}
            <div />
            {['Coluna A (principal)', 'Coluna B (transbordo)', 'Coluna C (completo)'].map((h) => (
              <div key={h} style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 0' }}>{h}</div>
            ))}
            {/* Rows */}
            {[
              { rua: 'Rua 1 - Pequenas', blocos: [1, 2, 3] },
              { rua: 'Rua 2 - Médias', blocos: [4, 5, 6] },
              { rua: 'Rua 3 - Grandes', blocos: [7, 8, 9] },
            ].map(({ rua, blocos }) => (
              <React.Fragment key={rua}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', paddingRight: 8, whiteSpace: 'nowrap' }}>
                  {rua}
                </div>
                {blocos.map((b) => {
                  const count = ocupacao[b] || 0;
                  const limit = 40;
                  const percentage = Math.min((count / limit) * 100, 100);
                  const isOverLimit = count >= limit;

                  return (
                    <div key={b} style={{
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
                    }}>
                      {/* Progress fill bar */}
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
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
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">Sistema de endereçamento - Expedição WIKA</footer>
    </div>
  );
}
