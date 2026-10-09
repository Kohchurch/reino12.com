import fs from "node:fs/promises";
import sharp from "sharp";

// Use the supplied logo unchanged, removing only transparent padding.
const png = await sharp("public/rdc-logo-lg.png").trim().resize(192, 192).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // ICO
header.writeUInt16LE(1, 4); // one image
header[6] = 192;
header[7] = 192;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await fs.writeFile("public/favicon.ico", Buffer.concat([header, png]));
await fs.writeFile("public/apple-touch-icon.png", png);
console.log("Generated 192px icons from the supplied KOH logo.");
