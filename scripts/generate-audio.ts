import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_LETTERS } from '../app/db/seed-data';
import { composeLetter, VOWEL_MODES } from '../app/lib/utils/harakat';
import type { VowelMode } from '../app/lib/utils/harakat';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = resolve(__dirname, '..', 'public', 'audio', 'letters');

// Unicode constants for hamza-carrying alif variants
const ALEF_WITH_HAMZA_ABOVE = '\u0623'; // أ
const ALEF_WITH_HAMZA_BELOW = '\u0625'; // إ
const DAMMAH = '\u064F';
const FATHAH = '\u064E';
const KASRAH = '\u0650';

/**
 * Return the text to send to the TTS engine.
 *
 * For display, letters use `composeLetter()` which appends a combining
 * diacritic to the bare letter. For most consonants this works fine, but
 * for alef (ا) at the start of a syllable, Standard Arabic requires a
 * hamza carrier: أَ / إِ / أُ instead of اَ / اِ / اُ. Google TTS
 * produces barely-audible breath for the non-standard form, especially
 * alef + dammah (اُ).
 *
 * This function returns the standard Arabic form for TTS while the app
 * still displays the simplified form for young learners.
 */
function ttsInputText(character: string, vowelMode: VowelMode): string {
  if (vowelMode === 'none') return character;

  // Alef needs a hamza carrier for initial vowels in Standard Arabic
  if (character === '\u0627') {
    // ا (U+0627, ARABIC LETTER ALEF)
    if (vowelMode === 'dammah') return ALEF_WITH_HAMZA_ABOVE + DAMMAH; // أُ
    if (vowelMode === 'fathah') return ALEF_WITH_HAMZA_ABOVE + FATHAH; // أَ
    if (vowelMode === 'kasrah') return ALEF_WITH_HAMZA_BELOW + KASRAH; // إِ
  }

  return composeLetter(character, vowelMode);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const client = new TextToSpeechClient();
  let failedCount = 0;
  let totalCount = 0;

  for (const letter of SEED_LETTERS) {
    for (const vowelMode of VOWEL_MODES) {
      const filename = letter.audioFiles[vowelMode];
      const outputPath = resolve(OUTPUT_DIR, filename);

      if (existsSync(outputPath)) {
        console.log(`Skipping ${filename} (already exists)`);
        continue;
      }

      const text = ttsInputText(letter.character, vowelMode);
      totalCount++;

      try {
        const [response] = await client.synthesizeSpeech({
          input: { ssml: `<speak>${text}</speak>` },
          voice: { languageCode: 'ar-XA', ssmlGender: 'FEMALE' },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.85 },
        });

        if (!response.audioContent) {
          throw new Error('No audio content received');
        }

        await writeFile(outputPath, Buffer.from(response.audioContent));
        console.log(`Generated ${filename} -> "${text}"`);
      } catch (error) {
        console.error(`Failed to generate ${filename}:`, error);
        failedCount++;
      }
    }
  }

  const generatedCount = totalCount - failedCount;
  console.log(`\nDone. Generated ${generatedCount}/${totalCount} files.`);
  process.exit(failedCount > 0 ? 1 : 0);
}

main();
