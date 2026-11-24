// Positions are schematic coordinates in the lateral view: front is left.
// Each pose controls tongue tip, body and dorsum, jaw, lip rounding and lip closure.
const pose = (tip, body, back, jaw, round = 0, close = 0) => ({
  tipX: tip[0], tipY: tip[1], bodyX: body[0], bodyY: body[1], backX: back[0],
  backY: back[1], jaw, round, close, glottis: .5,
});
const vowel = (jaw, front, height, round = 0) =>
  pose([54 + front * 14, 98 + jaw * .35], [98 + front * 26, height],
    [159 + front * 15, height + 6 - front * 20], jaw, round);
export const rest = vowel(16, .5, 97);
const high = vowel(8, 0, 63);
const lax = vowel(15, .23, 75);
const mid = vowel(24, .15, 83);
const open = vowel(43, .05, 108);
const ah = vowel(44, .85, 112);
const roundedOpen = vowel(33, .89, 98, .72);
const roundedMid = vowel(23, .75, 87, .9);
const roundedLax = vowel(14, .65, 77, .69);
const roundedHigh = vowel(8, .6, 67, .95);
const central = vowel(23, .52, 90);
const alveolar = pose([74, 63], [105, 86], [166, 96], 12);
const velar = pose([64, 101], [113, 91], [176, 63], 14);
const dental = pose([30, 80], [96, 88], [166, 99], 13);
const bilabial = { ...rest, jaw: 3, close: 1 };
const labiodental = { ...rest, jaw: 6, close: .6 };
const hiss = pose([70, 69], [103, 78], [165, 94], 12);
const sh = pose([84, 71], [105, 64], [165, 90], 12, .46);
const rhotic = pose([82, 71], [114, 77], [168, 89], 14, .25);
const openGlottis = { ...rest, glottis: 1 };
const closedGlottis = { ...rest, glottis: 0 };
const darkL = pose([74, 63], [112, 102], [170, 73], 16);

const hold = (position, seconds = 1.2) => ({
  focus: position, duration: seconds,
  frames: [[0, rest], [.2, position], [.78, position], [1, rest]],
});
const glide = (from, to, seconds = 1.4) => ({
  focus: from, duration: seconds,
  frames: [[0, rest], [.18, from], [.73, to], [1, rest]],
});
const stop = position => ({
  focus: position, duration: 1,
  frames: [[0, rest], [.28, position], [.54, position], [.63, rest], [1, rest]],
});
const clip = (word, focus, segments, voiced = true) => {
  const duration = segments.at(-1)[0];
  return {
    focus, duration, voiced, clip: word,
    frames: segments.map(([seconds, position]) => [seconds / duration, position]),
  };
};

export const motions = {
  '/ɪ/': clip('ship', lax, [[0, rest], [.164, sh], [.2733, lax], [.3799, lax],
    [.42, bilabial], [.4994, bilabial], [.6679, rest]]),
  '/iː/': clip('sheep', high, [[0, rest], [.1586, sh], [.2679, high], [.3837, high],
    [.43, bilabial], [.5048, bilabial], [.6532, rest]]),
  '/e/': hold(mid),
  '/æ/': clip('bad', open, [[0, rest], [.2162, bilabial], [.2572, open], [.4825, open],
    [.515, alveolar], [.5568, alveolar], [.7518, rest]]),
  '/ɑː/': hold(ah, 1.5), '/ɒ/': hold(roundedOpen), '/ɔː/': hold(roundedMid, 1.5),
  '/ʊ/': hold(roundedLax), '/uː/': hold(roundedHigh, 1.5),
  '/ʌ/': hold(vowel(30, .54, 99)), '/ɜː/': hold(central, 1.5), '/ə/': hold(rest, .9),
  '/eɪ/': glide(mid, lax), '/aɪ/': glide(open, lax), '/ɔɪ/': glide(roundedMid, lax),
  '/aʊ/': glide(open, roundedLax), '/əʊ/': glide(central, roundedHigh),
  '/ɪə/': glide(lax, rest), '/eə/': glide(mid, rest), '/ʊə/': glide(roundedLax, rest),
  '/p/': stop(bilabial), '/b/': stop(bilabial), '/t/': stop(alveolar), '/d/': stop(alveolar),
  '/k/': stop(velar), '/g/': stop(velar), '/f/': hold(labiodental), '/v/': hold(labiodental),
  '/θ/': clip('thin', dental, [[0, rest], [.177, rest], [.1973, dental], [.2658, dental],
    [.295, lax], [.3724, lax], [.403, alveolar], [.5484, alveolar], [.7434, rest]], false),
  '/ð/': clip('then', dental, [[0, rest], [.177, rest], [.1973, dental], [.217, dental],
    [.248, mid], [.3093, mid], [.34, alveolar], [.4555, alveolar], [.6308, rest]]),
  '/s/': hold(hiss), '/z/': hold(hiss), '/ʃ/': hold(sh), '/ʒ/': hold(sh),
  '/h/': hold(openGlottis), '/tʃ/': glide(alveolar, sh), '/dʒ/': glide(alveolar, sh),
  '/m/': hold(bilabial), '/n/': hold(alveolar), '/ŋ/': hold(velar), '/l/': hold(alveolar),
  '/r/': hold(rhotic), '/j/': glide(high, rest, .8), '/w/': glide(roundedHigh, rest, .8),
  '[ɾ]': stop(alveolar), '[ʔ]': stop(closedGlottis), '[ɫ]': hold(darkL), 'linking R': glide(rhotic, rest),
};

export function sample(frames, at) {
  const progress = Math.max(0, Math.min(1, at));
  const after = frames.findIndex(([time]) => time >= progress);
  if (after === 0) return frames[0][1];
  if (after < 0) return frames.at(-1)[1];
  if (frames[after][0] === progress) return frames[after][1];
  const [start, from] = frames[after - 1];
  const [end, to] = frames[after];
  const weight = (progress - start) / (end - start);
  return Object.fromEntries(Object.keys(from).map(key => [key, from[key] + weight * (to[key] - from[key])]));
}
