import { db, isFirebaseConfigured } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  runTransaction,
  onSnapshot,
  collection,
} from 'firebase/firestore';
import { FAMILIAS, BLOCOS, LIMITE_TRANSBORDO, type RegistroCaixa } from './constants';

// Helper for local storage subscription listeners
const listeners: Array<(...args: any[]) => void> = [];

function notifyListeners(pedido: string, caixas: RegistroCaixa[]) {
  listeners.forEach((cb) => cb(pedido, caixas));
}

// ── Pedidos ──────────────────────────────────────────────────────────────────

export async function getPedido(pedido: string): Promise<RegistroCaixa[]> {
  if (!isFirebaseConfigured) {
    try {
      const data = localStorage.getItem('pedido:' + pedido);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  const ref = doc(db, 'pedidos', pedido);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().caixas as RegistroCaixa[]) : [];
}

export async function setPedido(pedido: string, caixas: RegistroCaixa[]): Promise<void> {
  if (!isFirebaseConfigured) {
    localStorage.setItem('pedido:' + pedido, JSON.stringify(caixas));
    notifyListeners(pedido, caixas);
    return;
  }

  await setDoc(doc(db, 'pedidos', pedido), { caixas, updatedAt: new Date().toISOString() });
}

export async function deletePedido(pedido: string): Promise<void> {
  if (!isFirebaseConfigured) {
    localStorage.removeItem('pedido:' + pedido);
    notifyListeners(pedido, []);
    return;
  }

  await deleteDoc(doc(db, 'pedidos', pedido));
}

export function subscribePedido(pedido: string, cb: (caixas: RegistroCaixa[]) => void) {
  if (!isFirebaseConfigured) {
    // Call immediately
    getPedido(pedido).then(cb);
    // Listen to local changes
    const handler = (p: string, caixas: RegistroCaixa[]) => {
      if (p === pedido) cb(caixas);
    };
    listeners.push(handler);
    return () => {
      const index = listeners.indexOf(handler);
      if (index > -1) listeners.splice(index, 1);
    };
  }

  const ref = doc(db, 'pedidos', pedido);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? (snap.data().caixas as RegistroCaixa[]) : []);
  });
}

// ── Contadores de bloco ───────────────────────────────────────────────────────

export async function getContador(bloco: number): Promise<number> {
  if (!isFirebaseConfigured) {
    try {
      const data = localStorage.getItem('contador:' + bloco);
      return data ? parseInt(data, 10) : 0;
    } catch {
      return 0;
    }
  }

  const ref = doc(db, 'contadores', String(bloco));
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().valor as number) : 0;
}

export async function nextPosicao(bloco: number): Promise<number> {
  if (!isFirebaseConfigured) {
    const val = (await getContador(bloco)) + 1;
    localStorage.setItem('contador:' + bloco, String(val));
    return val;
  }

  const ref = doc(db, 'contadores', String(bloco));
  let nova = 1;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    nova = snap.exists() ? (snap.data().valor as number) + 1 : 1;
    tx.set(ref, { valor: nova });
  });
  return nova;
}

export async function blocoIncompletoParaRua(rua: 1 | 2 | 3): Promise<number> {
  const bl = BLOCOS[rua];
  const contPrincipal = await getContador(bl.principal);
  return contPrincipal < LIMITE_TRANSBORDO ? bl.principal : bl.transbordo;
}

// ── Ação: Guardar caixa ──────────────────────────────────────────────────────

export async function guardarCaixa(
  pedido: string,
  caixa: string,
  codigoItem: string,
  ordemProducao: string,
): Promise<{ bloco: number; posicao: number; total: number }> {
  const familia = FAMILIAS[caixa];
  if (!familia) throw new Error(`Código de caixa desconhecido: ${caixa}`);

  const existentes = await getPedido(pedido);

  let bloco: number;
  if (existentes.length > 0) {
    bloco = existentes[0].bloco;
  } else {
    bloco = await blocoIncompletoParaRua(familia.rua);
  }

  const posicao = await nextPosicao(bloco);
  const registro: RegistroCaixa = {
    caixa,
    codigoItem,
    ordemProducao,
    rua: familia.rua,
    bloco,
    posicao,
    ts: new Date().toISOString(),
  };

  existentes.push(registro);
  await setPedido(pedido, existentes);
  return { bloco, posicao, total: existentes.length };
}

// ── Ação: Marcar completo ─────────────────────────────────────────────────────

export async function marcarCompleto(pedido: string): Promise<RegistroCaixa[]> {
  const registros = await getPedido(pedido);
  if (registros.length === 0) throw new Error('Pedido não encontrado.');

  const rua = registros[0].rua as 1 | 2 | 3;
  const blocoCompleto = BLOCOS[rua].completo;

  const novos: RegistroCaixa[] = [];
  for (const r of registros) {
    const posicao = await nextPosicao(blocoCompleto);
    novos.push({ ...r, bloco: blocoCompleto, posicao });
  }

  await setPedido(pedido, novos);
  return novos;
}

// ── Ação: Liberar posição ─────────────────────────────────────────────────────

export async function liberarPosicao(pedido: string): Promise<void> {
  await deletePedido(pedido);
}

export function subscribeOcupacao(cb: (ocupacao: Record<number, number>) => void) {
  const initialOcupacao = () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 });

  if (!isFirebaseConfigured) {
    const calculateLocal = () => {
      const oc: Record<number, number> = initialOcupacao();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pedido:')) {
          try {
            const caixas = JSON.parse(localStorage.getItem(key) || '[]');
            caixas.forEach((c: any) => {
              if (oc[c.bloco] !== undefined) oc[c.bloco]++;
            });
          } catch {}
        }
      }
      return oc;
    };

    // Trigger immediately
    cb(calculateLocal());

    // Listen to local changes
    const handler = () => {
      cb(calculateLocal());
    };
    listeners.push(handler);
    return () => {
      const index = listeners.indexOf(handler);
      if (index > -1) listeners.splice(index, 1);
    };
  }

  // Firebase real-time subscription
  return onSnapshot(collection(db, 'pedidos'), (snap) => {
    const oc: Record<number, number> = initialOcupacao();
    snap.forEach((doc) => {
      const caixas = doc.data().caixas as RegistroCaixa[];
      if (Array.isArray(caixas)) {
        caixas.forEach((c) => {
          if (oc[c.bloco] !== undefined) oc[c.bloco]++;
        });
      }
    });
    cb(oc);
  });
}
