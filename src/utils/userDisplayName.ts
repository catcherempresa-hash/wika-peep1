const DISPLAY_NAME_BY_EMAIL: Record<string, string> = {
  'diego@wika.com': 'Diego',
  'teste@wika.com': 'Conta Teste',
  'nayara@wika.com': 'Nayara',
  'mariana@wika.com': 'Mariana',
  'juliana@wika.com': 'Juliana',
};

const STORAGE_KEY = 'wika_user_display_names';

function readOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Record<string, string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function getUserDisplayName(email?: string | null): string {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return 'Usuário';

  const overrides = readOverrides();
  if (overrides[normalizedEmail]) {
    return overrides[normalizedEmail];
  }

  const knownName = DISPLAY_NAME_BY_EMAIL[normalizedEmail];
  if (knownName) {
    return knownName;
  }

  return normalizedEmail.split('@')[0];
}

export function setUserDisplayName(email: string, displayName: string) {
  const normalizedEmail = email?.trim().toLowerCase();
  const name = displayName?.trim();

  if (!normalizedEmail || !name) return;

  const overrides = readOverrides();
  overrides[normalizedEmail] = name;
  writeOverrides(overrides);
}
