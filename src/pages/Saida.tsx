import { useState } from 'react';
import Navbar from '../components/Navbar';
import BarcodeScanner from '../components/BarcodeScanner';
import { getPedido, marcarCompleto, liberarPosicao } from '../services';
import { BLOCOS, type RegistroCaixa } from '../constants';

type ResultState =
  | { type: 'found'; pedido: string; registros: RegistroCaixa[]; isCompleto: boolean }
  | { type: 'released'; pedido: string }
  | { type: 'error'; message: string }
  | null;

export default function Saida() {
  const [pedido, setPedido] = useState('');
  const [loading, setLoading] = useState<'buscar' | 'completo' | 'liberar' | null>(null);
  const [result, setResult] = useState<ResultState>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  function handleScanResult(code: string) {
    setPedido(code);
    setScannerOpen(false);
  }

  async function handleBuscar(e?: React.FormEvent) {
    e?.preventDefault();
    const p = pedido.trim().toUpperCase();
    if (!p) { setResult({ type: 'error', message: 'Informe o número do pedido de venda.' }); return; }
    setLoading('buscar');
    setResult(null);
    try {
      const registros = await getPedido(p);
      if (registros.length === 0) {
        setResult({ type: 'error', message: 'Nenhuma caixa encontrada para este pedido.' });
        return;
      }
      const rua = registros[0].rua as 1 | 2 | 3;
      const blocoCompleto = BLOCOS[rua].completo;
      const isCompleto = registros.every((r) => r.bloco === blocoCompleto);
      setResult({ type: 'found', pedido: p, registros, isCompleto });
    } catch {
      setResult({ type: 'error', message: 'Erro ao buscar. Verifique a conexão e tente novamente.' });
    } finally {
      setLoading(null);
    }
  }

  async function handleMarcarCompleto() {
    if (result?.type !== 'found') return;
    setLoading('completo');
    try {
      const novos = await marcarCompleto(result.pedido);
      setResult({ type: 'found', pedido: result.pedido, registros: novos, isCompleto: true });
    } catch (err: any) {
      setResult({ type: 'error', message: err?.message ?? 'Erro ao marcar como completo.' });
    } finally {
      setLoading(null);
    }
  }

  async function handleLiberar() {
    if (result?.type !== 'found') return;
    const p = result.pedido;
    setLoading('liberar');
    try {
      await liberarPosicao(p);
      setResult({ type: 'released', pedido: p });
      setPedido('');
    } catch {
      setResult({ type: 'error', message: 'Erro ao liberar posição. Tente novamente.' });
    } finally {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;

  return (
    <div className="page-main">
      <Navbar subtitle="Estação de Saída" showBack backTo="/estacoes" />

      <main className="content-wrap">
        <div className="page-header">
          <h1>Buscar pedido</h1>
          <p className="subtitle">Localize o pedido para coletar, marcar completo ou liberar posição.</p>
        </div>

        <div className="card">
          <form onSubmit={handleBuscar} noValidate>
            <div className="field">
              <label htmlFor="saida-pedido">Pedido de venda</label>
              <div className="input-group">
                <input
                  id="saida-pedido"
                  value={pedido}
                  onChange={(e) => { setPedido(e.target.value); setResult(null); }}
                  placeholder="ex: SO00317243"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  id="saida-scan"
                  className="btn btn-scan"
                  onClick={() => setScannerOpen(true)}
                  disabled={isLoading}
                  title="Ler código de barras"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 5a2 2 0 012-2h1M3 19a2 2 0 002 2h1M19 3h1a2 2 0 012 2v1M21 19v1a2 2 0 01-2 2h-1" />
                    <line x1="7" y1="7" x2="7" y2="17" /><line x1="10" y1="7" x2="10" y2="17" />
                    <line x1="13" y1="7" x2="13" y2="11" /><line x1="17" y1="7" x2="17" y2="17" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              id="saida-buscar"
              type="submit"
              className="btn btn-primary btn-full mt-16"
              disabled={isLoading}
            >
              {loading === 'buscar' ? <><span className="spinner" />Buscando…</> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Buscar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Found result */}
        {result?.type === 'found' && (
          <div className="card mt-16" style={{ animation: 'slideUp 250ms cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h2 style={{ margin: 0 }}>Pedido {result.pedido}</h2>
              <span className={`badge ${result.isCompleto ? 'badge-green' : 'badge-amber'}`}>
                {result.isCompleto ? (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg> Pronto para coleta</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> Em andamento</>
                )}
              </span>
            </div>

            <div className="item-list">
              {result.registros.map((r, i) => (
                <div key={i} className="item-row">
                  <div>
                    <div className="item-code">{r.caixa}</div>
                    {(r.codigoItem || r.ordemProducao) && (
                      <div className="item-sub">
                        {r.codigoItem && `Item: ${r.codigoItem}`}
                        {r.codigoItem && r.ordemProducao && ' | '}
                        {r.ordemProducao && `OP: ${r.ordemProducao}`}
                      </div>
                    )}
                    <div className="item-sub" style={{ marginTop: 2 }}>{new Date(r.ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div>
                  </div>
                  <span className="badge badge-blue">
                    Bloco {r.bloco} · {String(r.posicao).padStart(3, '0')}
                  </span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {!result.isCompleto && (
                <button
                  id="saida-marcar-completo"
                  className="btn btn-secondary btn-full"
                  onClick={handleMarcarCompleto}
                  disabled={isLoading}
                >
                  {loading === 'completo' ? <><span className="spinner spinner-blue" />Movendo para coluna C…</> : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Marcar pedido como completo
                    </>
                  )}
                </button>
              )}

              <button
                id="saida-liberar"
                className="btn btn-danger btn-full"
                onClick={handleLiberar}
                disabled={isLoading}
              >
                {loading === 'liberar' ? <><span className="spinner" style={{ borderTopColor: 'var(--red)' }} />Liberando…</> : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                    Liberar posição (caixa coletada)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Released */}
        {result?.type === 'released' && (
          <div className="alert alert-success mt-16" style={{ animation: 'slideUp 250ms ease' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>
                <strong>Pedido {result.pedido} liberado.</strong><br />
                <span style={{ fontSize: '0.875rem' }}>A posição está disponível para um novo pedido.</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {result?.type === 'error' && (
          <div className="alert alert-error mt-16" role="alert">
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {result.message}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">Estação de Saída</footer>

      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onResult={handleScanResult}
      />
    </div>
  );
}
