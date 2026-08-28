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

export function applyTraceFilter(canvas: HTMLCanvasElement, mode: FilterMode, threshold: number): void {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  const gray = new Uint8ClampedArray(canvas.width * canvas.height);
  for (let pixel = 0; pixel < gray.length; pixel += 1) {
    const offset = pixel * 4;
    gray[pixel] = Math.round(data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114);
  }

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const pixel = y * canvas.width + x;
      const offset = pixel * 4;
      let value = gray[pixel];
      if (mode === 'threshold') value = value >= threshold ? 255 : 20;
      if (mode === 'edges') {
        if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) {
          value = 255;
        } else {
          const a = gray[pixel - canvas.width - 1];
          const b = gray[pixel - canvas.width];
          const c = gray[pixel - canvas.width + 1];
          const d = gray[pixel - 1];
          const f = gray[pixel + 1];
          const g = gray[pixel + canvas.width - 1];
          const h = gray[pixel + canvas.width];
          const i = gray[pixel + canvas.width + 1];
          const gx = -a + c - 2 * d + 2 * f - g + i;
          const gy = -a - 2 * b - c + g + 2 * h + i;
          const edge = Math.min(255, Math.hypot(gx, gy));
          value = edge > 255 - threshold ? 18 : 255;
        }
      }
      data[offset] = value;
      data[offset + 1] = value;
      data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

export function drawDemoFrame(canvas: HTMLCanvasElement, index: number, total = 12): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const { width, height } = canvas;
  const phase = (index / total) * Math.PI * 2;
  context.fillStyle = '#fffaf0';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = '#d4c6ab';
  context.lineWidth = Math.max(1, width / 500);
  for (let x = 18; x < width; x += 34) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x + 8, height);
    context.stroke();
  }
  const cx = width * (0.2 + index / total * 0.62);
  const cy = height * (0.49 + Math.sin(phase) * 0.13);
  context.save();
  context.translate(cx, cy);
  context.rotate(Math.sin(phase) * 0.08);
  context.strokeStyle = '#181713';
  context.fillStyle = '#0b5f71';
  context.lineWidth = Math.max(3, width / 130);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.ellipse(0, 0, width * 0.095, height * 0.1, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  const wingLift = Math.sin(phase) * height * 0.13;
  context.fillStyle = '#bd3f32';
  context.beginPath();
  context.moveTo(-width * 0.02, 0);
  context.quadraticCurveTo(-width * 0.12, -height * 0.08 - wingLift, -width * 0.16, -height * 0.01 - wingLift);
  context.quadraticCurveTo(-width * 0.08, height * 0.04, -width * 0.01, height * 0.06);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = '#e6bd3c';
  context.beginPath();
  context.moveTo(width * 0.09, -height * 0.02);
  context.lineTo(width * 0.15, height * 0.01);
  context.lineTo(width * 0.09, height * 0.035);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = '#181713';
  context.beginPath();
  context.arc(width * 0.05, -height * 0.035, width * 0.009, 0, Math.PI * 2);
  context.fill();
  context.restore();
  context.strokeStyle = '#181713';
  context.lineWidth = Math.max(2, width / 180);
  context.beginPath();
  context.moveTo(width * 0.08, height * 0.78);
  context.quadraticCurveTo(width * 0.45, height * 0.73, width * 0.92, height * 0.8);
  context.stroke();
}

function canvasBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The browser could not create the image.')), type, quality);
  });
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number): Uint8Array {
  return new Uint8Array([value & 255, (value >>> 8) & 255]);
}

function u32(value: number): Uint8Array {
  return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]);
}

function joinBytes(parts: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

export async function makePngZip(frames: HTMLCanvasElement[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (let index = 0; index < frames.length; index += 1) {
    const name = encoder.encode(`flipbook-frame-${String(index + 1).padStart(3, '0')}.png`);
    const bytes = new Uint8Array(await (await canvasBlob(frames[index])).arrayBuffer());
    const crc = crc32(bytes);
    const local = joinBytes([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(bytes.length), u32(bytes.length), u16(name.length), u16(0), name, bytes]);
    locals.push(local);
    centrals.push(joinBytes([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(bytes.length), u32(bytes.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    offset += local.length;
  }
  const central = joinBytes(centrals);
  const end = joinBytes([u32(0x06054b50), u16(0), u16(0), u16(frames.length), u16(frames.length), u32(central.length), u32(offset), u16(0)]);
  const archive = joinBytes([...locals, central, end]);
  return new Blob([archive.buffer as ArrayBuffer], { type: 'application/zip' });
}

function drawContactSheet(frames: HTMLCanvasElement[], columns: number, startNumber: number, total: number): HTMLCanvasElement {
  const page = document.createElement('canvas');
  page.width = 1240;
  page.height = 1754;
  const context = page.getContext('2d');
  if (!context) return page;
  context.fillStyle = '#fffaf0';
  context.fillRect(0, 0, page.width, page.height);
  context.fillStyle = '#181713';
  context.font = 'bold 36px monospace';
  context.fillText('FLIPBOOK TRACE', 70, 72);
  context.font = '20px monospace';
  context.fillText(`${total} FRAMES  •  TRACE / CUT / STACK`, 70, 108);
  const gap = 18;
  const margin = 70;
  const cellWidth = (page.width - margin * 2 - gap * (columns - 1)) / columns;
  const ratio = frames[0] ? frames[0].height / frames[0].width : 0.65;
  const imageHeight = cellWidth * ratio;
  const cellHeight = imageHeight + 46;
  frames.forEach((frame, index) => {
    const x = margin + (index % columns) * (cellWidth + gap);
    const y = 144 + Math.floor(index / columns) * (cellHeight + gap);
    if (y + cellHeight > page.height - 60) return;
    context.strokeStyle = '#181713';
    context.lineWidth = 3;
    context.strokeRect(x, y, cellWidth, imageHeight);
    context.drawImage(frame, x + 3, y + 3, cellWidth - 6, imageHeight - 6);
    context.fillStyle = '#181713';
    context.font = 'bold 22px monospace';
    context.fillText(String(startNumber + index).padStart(2, '0'), x, y + imageHeight + 31);
  });
  return page;
}

export function makeContactSheets(frames: HTMLCanvasElement[], columns: number): HTMLCanvasElement[] {
  if (!frames.length) return [];
  const pageWidth = 1240;
  const pageHeight = 1754;
  const margin = 70;
  const gap = 18;
  const cellWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
  const imageHeight = cellWidth * frames[0].height / frames[0].width;
  const cellHeight = imageHeight + 46 + gap;
  const rows = Math.max(1, Math.floor((pageHeight - 144 - 60) / cellHeight));
  const perPage = rows * columns;
  const pages: HTMLCanvasElement[] = [];
  for (let start = 0; start < frames.length; start += perPage) {
    pages.push(drawContactSheet(frames.slice(start, start + perPage), columns, start + 1, frames.length));
  }
  return pages;
}

function ascii(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

export async function makePdf(frames: HTMLCanvasElement[], columns: number): Promise<Blob> {
  const content = ascii('q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n');
  const sheets = makeContactSheets(frames, columns);
  const pageReferences = sheets.map((_, index) => `${3 + index * 3} 0 R`).join(' ');
  const objects: Uint8Array[] = [
    ascii(`<< /Type /Catalog /Pages 2 0 R /Title (Flipbook Trace ${frames.length} frame PDF trace sheet) /FlipbookTraceFrameCount ${frames.length} /FlipbookTraceColumns ${columns} /FlipbookTraceCellNumbers [${frames.map((_, index) => index + 1).join(' ')}] /FlipbookTraceSheetWidth 1240 /FlipbookTraceSheetHeight 1754 >>`),
    ascii(`<< /Type /Pages /Kids [${pageReferences}] /Count ${sheets.length} >>`),
  ];
  for (let index = 0; index < sheets.length; index += 1) {
    const sheet = sheets[index];
    const pageObject = 3 + index * 3;
    const contentObject = pageObject + 1;
    const imageObject = pageObject + 2;
    const jpeg = new Uint8Array(await (await canvasBlob(sheet, 'image/jpeg', 0.9)).arrayBuffer());
    objects.push(
      ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`),
      joinBytes([ascii(`<< /Length ${content.length} >>\nstream\n`), content, ascii('endstream')]),
      joinBytes([ascii(`<< /Type /XObject /Subtype /Image /Width ${sheet.width} /Height ${sheet.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`), jpeg, ascii('\nendstream')]),
    );
  }
  const chunks: Uint8Array[] = [ascii('%PDF-1.4\n%----\n')];
  const offsets = [0];
  let offset = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(offset);
    const chunk = joinBytes([ascii(`${index + 1} 0 obj\n`), object, ascii('\nendobj\n')]);
    chunks.push(chunk);
    offset += chunk.length;
  });
  const xrefOffset = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) xref += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  chunks.push(ascii(`${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));
  const documentBytes = joinBytes(chunks);
  return new Blob([documentBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
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
