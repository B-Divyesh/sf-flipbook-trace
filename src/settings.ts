export type FilterMode = 'edges' | 'threshold' | 'gray';

export interface FrameSettings {
  fps: number;
  threshold: number;
  mode: FilterMode;
  onion: boolean;
  quality: number;
  columns: number;
}

export const defaultSettings: FrameSettings = {
  fps: 6,
  threshold: 142,
  mode: 'edges',
  onion: false,
  quality: 960,
  columns: 4,
};

export function normalizeSettings(input: unknown, studio: boolean): FrameSettings {
  if (!input || typeof input !== 'object') throw new Error('Invalid settings');
  const incoming = input as Partial<FrameSettings>;
  if (![2, 4, 6, 8, 12].includes(incoming.fps ?? 0)) throw new Error('Invalid frame rate');
  if (!['edges', 'threshold', 'gray'].includes(incoming.mode ?? '')) throw new Error('Invalid trace style');
  if (typeof incoming.threshold !== 'number' || incoming.threshold < 70 || incoming.threshold > 220) throw new Error('Invalid threshold');
  if (typeof incoming.onion !== 'boolean') throw new Error('Invalid onion setting');
  if (incoming.quality !== undefined && ![0, 960, 1920].includes(incoming.quality)) throw new Error('Invalid export width');
  if (incoming.columns !== undefined && ![4, 6].includes(incoming.columns)) throw new Error('Invalid column count');
  return {
    ...defaultSettings,
    ...incoming,
    quality: studio ? (incoming.quality ?? defaultSettings.quality) : defaultSettings.quality,
    columns: studio ? (incoming.columns ?? defaultSettings.columns) : defaultSettings.columns,
  };
}

export function downloadBlob(blob: Blob, name: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function savePreferences(settings: FrameSettings): Promise<void> {
  const request = indexedDB.open('flipbook-trace', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('preferences');
  await new Promise<void>((resolve, reject) => {
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const transaction = request.result.transaction('preferences', 'readwrite');
      transaction.objectStore('preferences').put(settings, 'current');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

export async function loadPreferences(): Promise<FrameSettings> {
  return new Promise((resolve) => {
    const request = indexedDB.open('flipbook-trace', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('preferences');
    request.onerror = () => resolve({ ...defaultSettings });
    request.onsuccess = () => {
      const get = request.result.transaction('preferences').objectStore('preferences').get('current');
      get.onsuccess = () => resolve({ ...defaultSettings, ...(get.result as Partial<FrameSettings> | undefined) });
      get.onerror = () => resolve({ ...defaultSettings });
    };
  });
}
