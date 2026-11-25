import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { sounds, materialByTarget } from '../pronunciation/content.mjs';
import { motions, rest, sample } from '../pronunciation/motion.mjs';

test('48 targets have stable indexes, pedagogical material and a valid timeline', () => {
  assert.equal(sounds.length, 48);
  assert.equal(new Set(sounds.map(sound => sound.ipa)).size, 48);
  assert.deepEqual(Object.keys(motions), sounds.map(sound => sound.ipa));
  assert.equal(sounds[28].ipa, '/θ/');
  assert.equal(sounds[47].ipa, 'linking R');
  for (const { ipa, word } of sounds) {
    const { focus, duration, frames, clip } = motions[ipa];
    assert.ok(duration > 0, ipa);
    assert.deepEqual(Object.keys(focus), Object.keys(rest), ipa);
    assert.equal(frames[0][0], 0, ipa);
    assert.equal(frames.at(-1)[0], 1, ipa);
    frames.forEach(([time, pose], index) => {
      assert.ok(!index || time > frames[index - 1][0], ipa);
      assert.ok(Object.values(pose).every(Number.isFinite), ipa);
      assert.deepEqual(sample(frames, time), pose, ipa);
    });
    assert.ok(materialByTarget[ipa].reference && materialByTarget[ipa].cue && materialByTarget[ipa].correction, ipa);
    if (clip) {
      assert.equal(clip, word);
      assert.ok(existsSync(new URL(`../pronunciation/audio/${clip}.mp3`, import.meta.url)));
    }
  }
});

test('interpolation moves each tongue region and both jaw and lip controls independently', () => {
  const end = Object.fromEntries(Object.keys(rest).map((key, index) => [key, rest[key] + index + 1]));
  const frames = [[0, rest], [1, end]];
  assert.equal(sample(frames, -1), rest);
  assert.deepEqual(sample(frames, 2), end);
  Object.keys(rest).forEach((key, index) => assert.equal(sample(frames, .5)[key], rest[key] + (index + 1) / 2));
});

test('the priority sounds keep distinct vowel positions and the same placement for both TH sounds', () => {
  const entries = ['/θ/', '/ð/', '/ɪ/', '/iː/', '/æ/'].map(ipa => motions[ipa]);
  assert.ok(entries.every(entry => entry.clip));
  const [thin, then, lax, long, open] = entries;
  assert.deepEqual(thin.focus, then.focus);
  assert.equal(thin.voiced, false);
  assert.equal(then.voiced, true);
  assert.ok(long.focus.bodyY < lax.focus.bodyY);
  assert.ok(open.focus.jaw > lax.focus.jaw);
});
