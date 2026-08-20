import { Buffer } from "node:buffer";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { NextResponse } from "next/server";
import { getServerStatusOrInitial } from "@/lib/firebase/server-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const legacyPluginUrl = "https://157-230-40-149.nip.io/downloads/TAKU-Voice-Proximity-v0.1.zip";
const downloadFilename = "ASIA-JP-MNG-KR-Test-Voice-Proximity-v0.1.zip";
const oldSetupFilename = "TAKUVoiceSetup.exe";
const newSetupFilename = "ASIA-JP-MNG-KR-Test-Voice-Setup.exe";
const readmeFilename = "README-MN.txt";

const readmeText = `ASIA JP,MNG,KR TEST PROXIMITY VOICE
======================================

Server
  Mumble: 157.230.40.149:64738
  Proximity bridge: 157.230.40.149:8890

Install
1. Install the official Mumble client: https://www.mumble.info/downloads/
2. Close Mumble completely.
3. Run ASIA-JP-MNG-KR-Test-Voice-Setup.exe.
4. Reopen Mumble.
5. Open Configure -> Settings -> Plugins.
6. Enable "Exile Voice - Spatial Audio".
7. Connect to mumble://157.230.40.149:64738

Automatic Steam link
1. Join ASIA JP,MNG,KR Test and spawn a dinosaur.
2. Sign in with Steam from the Voice page.
3. Connect to Mumble with the Steam-linked connection button.
4. Keep Mumble open while you play.
5. Proximity voice works automatically.

No manual verification
  No Mumble chat command is required.
  No game name entry is required.
  No six-digit code is required.

Voice range
  Full volume until about 8 metres.
  Fades between about 8 and 35 metres.
  Silent at about 35 metres and farther.

Security
  The plugin does not read or inject into The Isle memory.
  Player positions are read server-side through Evrima RCON.
  The installer is currently unsigned, so Windows SmartScreen may warn.

Installer SHA-256
  956775EF1A2B3B219504F956EA81D2F69CF50DDD0C04026542D723DA1A4564A7

Source and license
  Based on the MIT-licensed Exile Voice project:
  https://github.com/AlinV2V/the-isle-exile-voice
  See THIRD-PARTY-LICENSE.txt in this package.
`;

type ZipEntry = {
  name: string;
  compressionMethod: number;
  compressedSize: number;
  uncompressedSize: number;
  crc32: number;
  modTime: number;
  modDate: number;
  localOffset: number;
  data: Buffer;
};

const crcTable = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function fetchPackage(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok || !response.body) {
      return null;
    }

    return response;
  } catch {
    return null;
  }
}

function getEntryBasename(name: string) {
  return name.split(/[\\/]/).pop() ?? name;
}

function getRenamedEntryName(name: string) {
  const basename = getEntryBasename(name);

  if (basename !== oldSetupFilename) {
    return name;
  }

  return name.slice(0, name.length - oldSetupFilename.length) + newSetupFilename;
}

function findEndOfCentralDirectory(zip: Buffer) {
  for (let index = zip.length - 22; index >= 0; index -= 1) {
    if (zip.readUInt32LE(index) === 0x06054b50) {
      return index;
    }
  }

  return -1;
}

function getUncompressedData(entry: ZipEntry) {
  if (entry.compressionMethod === 0) {
    return entry.data;
  }

  if (entry.compressionMethod === 8) {
    return inflateRawSync(entry.data);
  }

  return null;
}

function parseZipEntries(zip: Buffer) {
  const eocdOffset = findEndOfCentralDirectory(zip);

  if (eocdOffset === -1) {
    return null;
  }

  const entryCount = zip.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = zip.readUInt32LE(eocdOffset + 16);
  const entries: ZipEntry[] = [];
  let pointer = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (zip.readUInt32LE(pointer) !== 0x02014b50) {
      return null;
    }

    const compressionMethod = zip.readUInt16LE(pointer + 10);
    const modTime = zip.readUInt16LE(pointer + 12);
    const modDate = zip.readUInt16LE(pointer + 14);
    const entryCrc32 = zip.readUInt32LE(pointer + 16);
    const compressedSize = zip.readUInt32LE(pointer + 20);
    const uncompressedSize = zip.readUInt32LE(pointer + 24);
    const nameLength = zip.readUInt16LE(pointer + 28);
    const extraLength = zip.readUInt16LE(pointer + 30);
    const commentLength = zip.readUInt16LE(pointer + 32);
    const localOffset = zip.readUInt32LE(pointer + 42);
    const name = zip.subarray(pointer + 46, pointer + 46 + nameLength).toString("utf8");

    if (zip.readUInt32LE(localOffset) !== 0x04034b50) {
      return null;
    }

    const localNameLength = zip.readUInt16LE(localOffset + 26);
    const localExtraLength = zip.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const data = zip.subarray(dataStart, dataStart + compressedSize);

    entries.push({
      name,
      compressionMethod,
      compressedSize,
      uncompressedSize,
      crc32: entryCrc32,
      modTime,
      modDate,
      localOffset,
      data
    });

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function buildZip(entries: ZipEntry[]) {
  const localChunks: Buffer[] = [];
  const centralChunks: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(entry.compressionMethod, 8);
    localHeader.writeUInt16LE(entry.modTime, 10);
    localHeader.writeUInt16LE(entry.modDate, 12);
    localHeader.writeUInt32LE(entry.crc32, 14);
    localHeader.writeUInt32LE(entry.compressedSize, 18);
    localHeader.writeUInt32LE(entry.uncompressedSize, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localChunks.push(localHeader, name, entry.data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(entry.compressionMethod, 10);
    centralHeader.writeUInt16LE(entry.modTime, 12);
    centralHeader.writeUInt16LE(entry.modDate, 14);
    centralHeader.writeUInt32LE(entry.crc32, 16);
    centralHeader.writeUInt32LE(entry.compressedSize, 20);
    centralHeader.writeUInt32LE(entry.uncompressedSize, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(localOffset, 42);
    centralChunks.push(centralHeader, name);

    localOffset += localHeader.length + name.length + entry.data.length;
  }

  const centralDirectoryOffset = localOffset;
  const centralDirectory = Buffer.concat(centralChunks);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(centralDirectoryOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, centralDirectory, eocd]);
}

function rebuildVoicePackage(zip: Buffer) {
  const entries = parseZipEntries(zip);

  if (!entries) {
    return { zip, renamedSetup: false, updatedReadme: false };
  }

  let renamedSetup = false;
  let updatedReadme = false;
  const rebuiltEntries: ZipEntry[] = [];

  for (const entry of entries) {
    const name = getRenamedEntryName(entry.name);
    const basename = getEntryBasename(entry.name);
    const uncompressedData = getUncompressedData(entry);

    if (!uncompressedData) {
      return { zip, renamedSetup: false, updatedReadme: false };
    }

    const nextData = basename === readmeFilename ? Buffer.from(readmeText, "utf8") : uncompressedData;
    const compressedData = entry.compressionMethod === 0 ? nextData : deflateRawSync(nextData);

    renamedSetup ||= name !== entry.name;
    updatedReadme ||= basename === readmeFilename;

    rebuiltEntries.push({
      ...entry,
      name,
      data: compressedData,
      compressedSize: compressedData.length,
      uncompressedSize: nextData.length,
      crc32: crc32(nextData)
    });
  }

  return { zip: buildZip(rebuiltEntries), renamedSetup, updatedReadme };
}

export async function GET() {
  const status = await getServerStatusOrInitial();
  const sourceUrl = status.voicePluginUrl || legacyPluginUrl;
  const response = (await fetchPackage(sourceUrl)) ?? (sourceUrl === legacyPluginUrl ? null : await fetchPackage(legacyPluginUrl));

  if (!response?.body) {
    return NextResponse.redirect(sourceUrl);
  }

  const sourceZip = Buffer.from(await response.arrayBuffer());
  const { zip, renamedSetup, updatedReadme } = rebuildVoicePackage(sourceZip);
  const body = new Uint8Array(zip);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${downloadFilename}"`,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-store",
      "X-Voice-Setup-Renamed": renamedSetup ? "true" : "false",
      "X-Voice-Readme-Updated": updatedReadme ? "true" : "false"
    }
  });
}
