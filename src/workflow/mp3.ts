function findSyncWord(buffer: Uint8Array, startOffset: number): number {
  for (let index = startOffset; index < buffer.length - 1; index += 1) {
    if (buffer[index] === 0xff && (buffer[index + 1] & 0xe0) === 0xe0) {
      return index;
    }
  }

  return -1;
}

function skipID3v2Tag(buffer: Uint8Array): number {
  if (buffer.length < 10) {
    return 0;
  }

  if (buffer[0] !== 0x49 || buffer[1] !== 0x44 || buffer[2] !== 0x33) {
    return 0;
  }

  const size =
    ((buffer[6] & 0x7f) << 21) |
    ((buffer[7] & 0x7f) << 14) |
    ((buffer[8] & 0x7f) << 7) |
    (buffer[9] & 0x7f);

  return 10 + size;
}

export function stripMp3Chunk(buffer: Uint8Array): Uint8Array {
  const id3Offset = skipID3v2Tag(buffer);
  const syncOffset = findSyncWord(buffer, id3Offset);
  const audioOffset = syncOffset >= 0 ? syncOffset : id3Offset;
  return buffer.slice(audioOffset);
}

export function concatenateUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return combined;
}
