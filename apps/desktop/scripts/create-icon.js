'use strict'

const fs = require('fs')
const path = require('path')

const assetsDir = path.join(__dirname, '..', 'assets')
const pngPath = path.join(assetsDir, 'icon.png')
const icoPath = path.join(assetsDir, 'icon.ico')

if (!fs.existsSync(pngPath)) {
  throw new Error('assets/icon.png não encontrado. Gere os assets da marca antes do build.')
}

const png = fs.readFileSync(pngPath)
const header = Buffer.alloc(22)

header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header[6] = 0
header[7] = 0
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(png.length, 14)
header.writeUInt32LE(22, 18)

fs.writeFileSync(icoPath, Buffer.concat([header, png]))
console.log('✓ assets/icon.ico atualizado a partir da nova marca.')
