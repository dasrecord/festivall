// Writes installed macOS font families to src/data/fonts.json for the live shout-out picker.
import { execFileSync } from 'child_process'
import { writeFileSync } from 'fs'

const js =
  'ObjC.import("AppKit"); JSON.stringify(ObjC.deepUnwrap($.NSFontManager.sharedFontManager.availableFontFamilies))'
const fonts = JSON.parse(execFileSync('osascript', ['-l', 'JavaScript', '-e', js], { encoding: 'utf8' }))
writeFileSync(new URL('../src/data/fonts.json', import.meta.url), JSON.stringify(fonts.sort(), null, 0) + '\n')
console.log(`Wrote ${fonts.length} fonts to src/data/fonts.json`)
