import { useState } from 'react';
import Navbar from '../components/Navbar';
import BarcodeScanner from '../components/BarcodeScanner';
import { guardarCaixa } from '../services';
import { FAMILIAS } from '../constants';

type SuccessModal = { bloco: number; posicao: number; caixa: string; total: number } | null;

type ResultState =
  | { type: 'error'; message: string }
  | null;

export default function Embalagem() {
  const [codigoItem, setCodigoItem] = useState('');
  const [ordemProducao, setOrdemProducao] = useState('');
  const [pedido, setPedido] = useState('');
  const [caixa, setCaixa] = useState(Object.keys(FAMILIAS)[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState>(null);
  const [modal, setModal] = useState<SuccessModal>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  function clearResult() { setResult(null); }

  function handleScanResult(code: string) {
    // If they scan a formatted code like "ITEM_OP_PEDIDO" or just anything, we parse or fill
    if (code.includes('-') || code.includes('|')) {
      const parts = code.split(/[-|]/);
      if (parts[0]) setCodigoItem(parts[0].trim());
      if (parts[1]) setOrdemProducao(parts[1].trim());
      if (parts[2]) setPedido(parts[2].trim());
    } else {
      // Mock populate with scanned info or auto-fill example for simulation
      setCodigoItem('ITM-008273');
      setOrdemProducao('OP-481928');
      setPedido(code || 'SO00317243');
    }
    setScannerOpen(false);
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!codigoItem.trim()) {
      setResult({ type: 'error', message: 'Informe o código do item.' });
      return;
    }
    if (!ordemProducao.trim()) {
      setResult({ type: 'error', message: 'Informe a ordem de produção.' });
      return;
    }
    if (!pedido.trim()) {
      setResult({ type: 'error', message: 'Informe o número do pedido de venda.' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await guardarCaixa(
        pedido.trim().toUpperCase(),
        caixa,
        codigoItem.trim().toUpperCase(),
        ordemProducao.trim().toUpperCase()
      );
      setModal({ ...res, caixa });
      // Clear for next box
      setCodigoItem('');
      setOrdemProducao('');
      setPedido('');
    } catch (err: any) {
      setResult({ type: 'error', message: err?.message ?? 'Erro ao registrar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  const familiaAtual = FAMILIAS[caixa];

  return (
    <div className="page-main">
      <Navbar subtitle="Estação de Embalagem" showBack backTo="/estacoes" />

      <main className="content-wrap">
        <div className="page-header">
          <h1>Guardar caixa</h1>
          <p className="subtitle">Informe os dados do produto e caixa para receber o endereço.</p>
        </div>

        <div className="card">
          {/* General large barcode scanner button at the top */}
          <button
            type="button"
            className="btn btn-secondary btn-full"
            style={{
              padding: '16px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              borderStyle: 'dashed',
              borderWidth: '2px',
              marginBottom: '24px',
              backgroundColor: 'var(--wika-blue-subtle)'
            }}
            onClick={() => setScannerOpen(true)}
            disabled={loading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5a2 2 0 012-2h1M3 19a2 2 0 002 2h1M19 3h1a2 2 0 012 2v1M21 19v1a2 2 0 01-2 2h-1" />
              <line x1="7" y1="7" x2="7" y2="17" /><line x1="10" y1="7" x2="10" y2="17" />
              <line x1="13" y1="7" x2="13" y2="17" /><line x1="17" y1="7" x2="17" y2="17" />
            </svg>
            <strong>Leitor de Código de Barras</strong>
          </button>

          <form onSubmit={handleGuardar} noValidate>
            {/* Código do Item */}
            <div className="field">
              <label htmlFor="emb-codigo-item">Código do Item</label>
              <input
                id="emb-codigo-item"
                value={codigoItem}
                onChange={(e) => { setCodigoItem(e.target.value); clearResult(); }}
                placeholder="ex: 720400"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Ordem de Produção */}
            <div className="field mt-16">
              <label htmlFor="emb-op">Ordem de Produção (OP)</label>
              <input
                id="emb-op"
                value={ordemProducao}
                onChange={(e) => { setOrdemProducao(e.target.value); clearResult(); }}
                placeholder="ex: OP-481928"
                disabled={loading}
              />
            </div>

            {/* Pedido de Venda */}
            <div className="field mt-16">
              <label htmlFor="emb-pedido">Pedido de venda</label>
              <input
                id="emb-pedido"
                value={pedido}
                onChange={(e) => { setPedido(e.target.value); clearResult(); }}
                placeholder="ex: SO00317243"
                disabled={loading}
              />
            </div>

            {/* Caixa */}
            <div className="field mt-16">
              <label htmlFor="emb-caixa">Código da caixa</label>
              <select
                id="emb-caixa"
                value={caixa}
                onChange={(e) => { setCaixa(e.target.value); clearResult(); }}
                disabled={loading}
              >
                <optgroup label="Rua 1 - Pequenas">
                  {Object.entries(FAMILIAS).filter(([, f]) => f.rua === 1).map(([code, f]) => (
                    <option key={code} value={code}>{code} - {f.dim}</option>
                  ))}
                </optgroup>
                <optgroup label="Rua 2 - Médias">
                  {Object.entries(FAMILIAS).filter(([, f]) => f.rua === 2).map(([code, f]) => (
                    <option key={code} value={code}>{code} - {f.dim}</option>
                  ))}
                </optgroup>
                <optgroup label="Rua 3 - Grandes">
                  {Object.entries(FAMILIAS).filter(([, f]) => f.rua === 3).map(([code, f]) => (
                    <option key={code} value={code}>{code} - {f.dim}</option>
                  ))}
                </optgroup>
              </select>
              {familiaAtual && (
                <p className="text-muted mt-4">
                  <span className="badge badge-blue">
                    {familiaAtual.rua === 1 ? 'Pequena' : familiaAtual.rua === 2 ? 'Média' : 'Grande'} - {familiaAtual.dim}
                  </span>
                </p>
              )}
            </div>

            <button
              id="emb-submit"
              type="submit"
              className="btn btn-primary btn-full mt-24"
              disabled={loading}
            >
              {loading ? <><span className="spinner" />Registrando…</> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                  Registrar posição
                </>
              )}
            </button>
          </form>
        </div>

        {/* Success Modal */}
        {modal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
              animation: 'fadeIn 200ms ease',
            }}
          >
            <div style={{
              background: 'var(--surface)',
              borderRadius: '24px',
              padding: '36px 28px 28px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
              animation: 'slideUp 280ms cubic-bezier(0.34,1.56,0.64,1)',
              textAlign: 'center',
            }}>
              {/* Ícone de sucesso */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Leve a caixa para
              </p>

              {/* Endereço em destaque */}
              <div style={{
                background: 'var(--wika-blue-subtle)',
                borderRadius: '16px',
                padding: '20px 24px',
                margin: '12px 0 16px',
                border: '2px solid var(--wika-blue)',
              }}>
                <div style={{
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  color: 'var(--wika-dark)',
                  letterSpacing: '-1px',
                  lineHeight: 1.1,
                }}>Bloco {modal.bloco}</div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--wika-blue)',
                  letterSpacing: '0.05em',
                  marginTop: 4,
                }}>Posição {String(modal.posicao).padStart(3, '0')}</div>
              </div>

              <p style={{ margin: '0 0 24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Caixa <strong>{modal.caixa}</strong> registrada · {modal.total} caixa(s) neste pedido
              </p>

              {/* Botão de confirmação */}
              <button
                id="emb-confirmar-posicao"
                className="btn btn-primary btn-full"
                style={{ fontSize: '1rem', padding: '14px', gap: '10px' }}
                onClick={() => setModal(null)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Caixa colocada no lugar ✓
              </button>
            </div>
          </div>
        )}

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

      <footer className="footer">Estação de Embalagem</footer>

      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onResult={handleScanResult}
      />
    </div>
  );
}
