// Tiny zip extractor using only Node built-ins. Supports STORED and DEFLATE.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function readUInt16(buf, off) { return buf.readUInt16LE(off); }
function readUInt32(buf, off) { return buf.readUInt32LE(off); }

function findEOCD(buf) {
  // EOCD signature: 0x06054b50
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (readUInt32(buf, i) === 0x06054b50) return i;
  }
  throw new Error("EOCD not found");
}

export function extractZip(zipPath, outDir) {
  const buf = fs.readFileSync(zipPath);
  const eocd = findEOCD(buf);
  const totalEntries = readUInt16(buf, eocd + 10);
  const cdSize = readUInt32(buf, eocd + 12);
  const cdOffset = readUInt32(buf, eocd + 16);
  let off = cdOffset;
  const files = [];
  for (let i = 0; i < totalEntries; i++) {
    if (readUInt32(buf, off) !== 0x02014b50) throw new Error("bad CD entry");
    const compMethod = readUInt16(buf, off + 10);
    const compSize = readUInt32(buf, off + 20);
    const uncompSize = readUInt32(buf, off + 24);
    const nameLen = readUInt16(buf, off + 28);
    const extraLen = readUInt16(buf, off + 30);
    const commentLen = readUInt16(buf, off + 32);
    const localOffset = readUInt32(buf, off + 42);
    const name = buf.slice(off + 46, off + 46 + nameLen).toString("utf8");
    files.push({ name, compMethod, compSize, uncompSize, localOffset });
    off += 46 + nameLen + extraLen + commentLen;
  }
  const written = [];
  for (const f of files) {
    if (f.name.endsWith("/")) continue;
    if (readUInt32(buf, f.localOffset) !== 0x04034b50) throw new Error("bad local header for " + f.name);
    const lhNameLen = readUInt16(buf, f.localOffset + 26);
    const lhExtraLen = readUInt16(buf, f.localOffset + 28);
    const dataStart = f.localOffset + 30 + lhNameLen + lhExtraLen;
    const compData = buf.slice(dataStart, dataStart + f.compSize);
    let data;
    if (f.compMethod === 0) data = compData;
    else if (f.compMethod === 8) data = zlib.inflateRawSync(compData);
    else throw new Error("unsupported method " + f.compMethod + " for " + f.name);
    const outPath = path.join(outDir, f.name);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, data);
    written.push(outPath);
  }
  return written;
}

if (process.argv[2] && process.argv[3]) {
  const written = extractZip(process.argv[2], process.argv[3]);
  console.log("Extracted", written.length, "files to", process.argv[3]);
}
