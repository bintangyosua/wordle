import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'src', 'constants');

function convertTxtToTs(txtFile, exportName, expectedLength) {
  const raw = fs.readFileSync(path.join(dir, txtFile), 'utf-8');
  const words = raw
    .split(/\r?\n/)
    .map(w => w.trim().toLowerCase().replace(/[^a-z]/g, ''))
    .filter(w => w.length === expectedLength)
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .sort();

  const tsContent = `export const ${exportName} = [\n${words.map(w => `\t'${w}',`).join('\n')}\n];\n`;
  const outFile = path.join(dir, `words${expectedLength}.ts`);
  fs.writeFileSync(outFile, tsContent, 'utf-8');
  console.log(`${txtFile} -> words${expectedLength}.ts: ${words.length} words`);
}

convertTxtToTs('4letters.txt', 'WORDS_4', 4);
convertTxtToTs('6letters.txt', 'WORDS_6', 6);
console.log('Done!');
