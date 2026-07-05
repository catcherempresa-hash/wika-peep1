import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onResult?: (code: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onResult }: Props) {
  const [manualCode, setManualCode] = useState('');

  if (!isOpen) return null;

  function handleManual() {
    if (manualCode.trim() && onResult) {
      onResult(manualCode.trim().toUpperCase());
      setManualCode('');
      onClose();
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Leitor de código de barras">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1rem' }}>Ler código de barras</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Fechar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Camera viewfinder */}
        <div className="barcode-viewfinder">
          <div className="barcode-corners" style={{ position: 'absolute', inset: 0 }}>
            {/* Extra corners */}
            <span style={{
              position: 'absolute', top: 20, right: 20,
              width: 60, height: 60,
              borderTop: '3px solid #00bfff', borderRight: '3px solid #00bfff',
              borderRadius: '0 4px 0 0',
            }} />
            <span style={{
              position: 'absolute', bottom: 20, left: 20,
              width: 60, height: 60,
              borderBottom: '3px solid #00bfff', borderLeft: '3px solid #00bfff',
              borderRadius: '0 0 0 4px',
            }} />
          </div>

          <div className="barcode-scan-line" />

          {/* Barcode icon */}
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ffffff30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ zIndex: 1 }}>
            <path d="M3 5a2 2 0 012-2h1M3 19a2 2 0 002 2h1M19 3h1a2 2 0 012 2v1M21 19v1a2 2 0 01-2 2h-1"/>
            <line x1="7" y1="7" x2="7" y2="17"/><line x1="10" y1="7" x2="10" y2="17"/>
            <line x1="13" y1="7" x2="13" y2="17"/><line x1="16" y1="9" x2="16" y2="15"/>
            <line x1="17" y1="7" x2="17" y2="17"/>
          </svg>
          <p className="barcode-hint">Aponte a câmera para o código de barras</p>
        </div>

        <div style={{ marginTop: 16, padding: '12px 0 0', borderTop: '1px solid var(--border)' }}>
          <p className="text-muted" style={{ marginBottom: 8, fontSize: '0.8125rem' }}>Ou digite manualmente:</p>
          <div className="input-group">
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Digite o código..."
              onKeyDown={(e) => e.key === 'Enter' && handleManual()}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={handleManual} style={{ flexShrink: 0 }}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
