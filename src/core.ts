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

export async function makePngZip(frames: Iterable<HTMLCanvasElement> | AsyncIterable<HTMLCanvasElement>): Promise<Blob> {
  const encoder = new TextEncoder();
  const locals: BlobPart[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  let frameCount = 0;
  for await (const frame of frames) {
    const index = frameCount;
    const name = encoder.encode(`flipbook-frame-${String(index + 1).padStart(3, '0')}.png`);
    const bytes = new Uint8Array(await (await canvasBlob(frame)).arrayBuffer());
    const crc = crc32(bytes);
    const localHeader = joinBytes([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(bytes.length), u32(bytes.length), u16(name.length), u16(0), name]);
    locals.push(localHeader.buffer as ArrayBuffer, bytes.buffer as ArrayBuffer);
    centrals.push(joinBytes([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(bytes.length), u32(bytes.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    offset += localHeader.length + bytes.length;
    frameCount += 1;
  }
  const central = joinBytes(centrals);
  const end = joinBytes([u32(0x06054b50), u16(0), u16(0), u16(frameCount), u16(frameCount), u32(central.length), u32(offset), u16(0)]);
  return new Blob([...locals, central.buffer as ArrayBuffer, end.buffer as ArrayBuffer], { type: 'application/zip' });
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
