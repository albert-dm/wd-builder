const fs = require('fs');
const src = fs.readFileSync('packages/wd-tarot/src/data/tarot.ts', 'utf8');

const match = src.match(/export const tarotData = \[([\s\S]*?)\];/);
if (!match) { console.error('No match'); process.exit(1); }

const arr = eval('(' + match[0].replace('export const tarotData = ', '') + ')');

let sql = '';
sql += 'DELETE FROM tarot_cards;\n';

for (const card of arr) {
  const id = card.id.replace(/'/g, "''");
  const name = card.name.replace(/'/g, "''");
  const arcana = card.arcana;
  const suit = card.suit || '';
  const numeral = card.numeral || '';
  const upright = (card.upright || []).map(s => s.replace(/'/g, "''")).join('\n');
  const reversed = (card.reversed || []).map(s => s.replace(/'/g, "''")).join('\n');

  sql += `INSERT INTO tarot_cards (id, name, arcana, suit, numeral, upright_keywords, reversed_keywords) VALUES ('${id}', '${name}', '${arcana}', '${suit}', '${numeral}', '${upright}', '${reversed}');\n`;
}

fs.writeFileSync('tarot-seed.sql', sql);
console.log(`Generated ${arr.length} card inserts`);
