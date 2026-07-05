// Domain constants for the Wika Expedition Addressing System

export const FAMILIAS: Record<string, { rua: 1 | 2 | 3; dim: string; label: string }> = {
  'BR021305': { rua: 1, dim: '105×105×120 mm', label: 'BR021305' },
  'BR021016': { rua: 1, dim: '120×150×160 mm', label: 'BR021016' },
  'BR015165': { rua: 1, dim: '160×240×260 mm', label: 'BR015165' },
  '260155':   { rua: 1, dim: '160×170×270 mm', label: '260155' },
  '340330':   { rua: 2, dim: '340×340×340 mm', label: '340330' },
  '330330':   { rua: 2, dim: '340×340×340 mm', label: '330330' },
  '8000':     { rua: 2, dim: '270×330×480 mm', label: '8000' },
  '550330':   { rua: 2, dim: '290×380×570 mm', label: '550330' },
  'BR009228': { rua: 2, dim: '170×380×570 mm', label: 'BR009228' },
  '720400':   { rua: 3, dim: '320×330×710 mm', label: '720400' },
  '22610':    { rua: 3, dim: '300×300×1000 mm', label: '22610' },
  'BR011818': { rua: 3, dim: '180×180×1100 mm', label: 'BR011818' },
  'BR011819': { rua: 3, dim: '180×360×1100 mm', label: 'BR011819' },
  'BR017120': { rua: 3, dim: '300×300×2000 mm', label: 'BR017120' },
};

export const RUA_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Rua 1 - Caixas Pequenas',
  2: 'Rua 2 - Caixas Médias',
  3: 'Rua 3 - Caixas Grandes',
};

// Bloco layout: each rua has 3 blocos
// A = principal (incomplete), B = overflow (incomplete), C = complete/ready to collect
export const BLOCOS: Record<1 | 2 | 3, { principal: number; transbordo: number; completo: number }> = {
  1: { principal: 1, transbordo: 2, completo: 3 },
  2: { principal: 4, transbordo: 5, completo: 6 },
  3: { principal: 7, transbordo: 8, completo: 9 },
};

export const LIMITE_TRANSBORDO = 40;

export const BLOCO_LABEL: Record<number, string> = {
  1: 'Bloco 1 - Pequenas (A)',
  2: 'Bloco 2 - Pequenas (B)',
  3: 'Bloco 3 - Pequenas (C) ✓',
  4: 'Bloco 4 - Médias (A)',
  5: 'Bloco 5 - Médias (B)',
  6: 'Bloco 6 - Médias (C) ✓',
  7: 'Bloco 7 - Grandes (A)',
  8: 'Bloco 8 - Grandes (B)',
  9: 'Bloco 9 - Grandes (C) ✓',
};

export type StatusPedido = 'andamento' | 'completo';

export interface RegistroCaixa {
  caixa: string;
  codigoItem?: string;
  ordemProducao?: string;
  rua: number;
  bloco: number;
  posicao: number;
  ts: string;
}
