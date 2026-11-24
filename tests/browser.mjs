// Start the static server and Chromium with remote debugging before running this test.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const origin = process.env.ERL_TEST_ORIGIN || 'http://127.0.0.1:8765';
const debuggerOrigin = process.env.ERL_CHROMIUM || 'http://127.0.0.1:9223';
const tabs = await (await fetch(debuggerOrigin + '/json/list')).json();
const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
const pending = new Map();
const exceptions = [];
let sequence = 0;
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(message.error.message));
  else request.resolve(message.result);
};
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || expression);
  return response.result.value;
}
async function until(expression) {
  for (let count = 0; count < 75; count++) {
    if (await evaluate(expression)) return;
    await delay(60);
  }
  assert.fail('Timed out: ' + expression);
}
const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
const viewport = (width, height) => send('Emulation.setDeviceMetricsOverride', {
  width, height, deviceScaleFactor: 1, mobile: width < 600,
});
try {
  await send('Runtime.enable');
  await send('Page.enable');
  await viewport(390, 844);
  await send('Page.navigate', { url: origin });
  await until("document.querySelectorAll('#catalog button').length === 48");
  await evaluate(`localStorage.setItem('coach_free_done_v1', '[0,28]');
    localStorage.setItem('erl-beginner', '{"Hello":true}')`);
  await send('Page.reload');
  await until("document.querySelector('#progress')?.textContent === '2/48'");
  assert.equal(await evaluate("document.querySelector('#beginner').hidden"), false);
  assert.match(await evaluate("document.querySelector('#bprogress').textContent"), /1 \/ 10/);
  await click('#navPronunciation');
  assert.equal(await evaluate("document.querySelector('main').hidden"), false);
  assert.equal(await evaluate("document.querySelectorAll('#catalog .done').length"), 2);
  for (const width of [320, 390, 768, 1280]) {
    await viewport(width, 844);
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'layout at ' + width);
  }
  await viewport(390, 844);
  for (const index of [28, 29, 0, 1, 3]) {
    await click(`[data-sound="${index}"]`);
    await click('#labPlay');
    await until("document.querySelector('#labDemo').currentTime > .025");
    assert.equal(await evaluate("document.querySelectorAll('.mouth-views svg').length"), 2);
  }
  const aligned = await evaluate(`import('/pronunciation/motion.mjs').then(module =>
    Object.values(module.motions).flatMap((motion, index) => motion.clip ? [[index, motion.duration]] : []))`);
  assert.equal(aligned.length, 37);
  for (const [index, expectedDuration] of aligned) {
    await click(`[data-sound="${index}"]`);
    const duration = await evaluate(`new Promise(resolve => {
      const audio = document.querySelector('#labDemo');
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.addEventListener('error', () => resolve(false), { once: true });
      audio.preload = 'metadata';
      audio.load();
    })`);
    assert.ok(Math.abs(duration - expectedDuration) < .09, 'clip duration for index ' + index);
  }
  await click('[data-sound="28"]');
  await evaluate(`document.querySelector('#labSpeed').value = '.5';
    document.querySelector('#labSpeed').dispatchEvent(new Event('change'))`);
  await click('#labRepeat');
  await click('#labPlay');
  await until("document.querySelector('#labDemo').currentTime > .2");
  const before = await evaluate("[...document.querySelectorAll('[data-part=side-jaw], [data-part=front-lips]')].map(x=>x.getAttribute('d'))");
  await delay(170);
  const after = await evaluate("[...document.querySelectorAll('[data-part=side-jaw], [data-part=front-lips]')].map(x=>x.getAttribute('d'))");
  assert.notEqual(before[0], after[0], 'lateral animation');
  assert.notEqual(before[1], after[1], 'frontal animation');
  await click('#labPlay');
  const paused = await evaluate("document.querySelector('#labDemo').currentTime");
  await delay(150);
  assert.equal(await evaluate("document.querySelector('#labDemo').currentTime"), paused);
  assert.deepEqual(await evaluate("['playbackRate','loop'].map(k=>document.querySelector('#labDemo')[k])"), [.5, true]);
  await click('#labPlay');
  await delay(1650);
  assert.equal(await evaluate("document.querySelector('#labDemo').paused"), false);
  await click('#labRepeat');
  await until("document.querySelector('#labDemo').ended");
  await click('[data-sound="4"]');
  await click('#labPlay');
  await until("document.querySelector('#labPlay').textContent === 'Reproduzir'");

  await evaluate(`document.querySelector('#locale').value = 'en-US';
    document.querySelector('#locale').dispatchEvent(new Event('change'))`);
  await click('[data-sound="28"]');
  await click('#labBoth');
  await until("document.querySelector('#labListening').src.endsWith('/thin.mp3') && !document.querySelector('#labListening').paused");
  await until("document.querySelector('#labListening').src.endsWith('/tin.mp3') && document.querySelector('#labListening').ended");
  await click('#labSurprise');
  assert.equal(await evaluate("document.querySelector('#labGuessWord').disabled"), true);
  await until("!document.querySelector('#labGuessWord').disabled");
  const heard = await evaluate("document.querySelector('#labListening').src");
  await click(heard.endsWith('/thin.mp3') ? '#labGuessWord' : '#labGuessContrast');
  assert.match(await evaluate("document.querySelector('#labAnswer').textContent"), /Isso mesmo/);

  await click('#labRecord');
  await until("document.querySelector('#labRecordingStatus').textContent.startsWith('Gravando')");
  await delay(400);
  await click('#labStop');
  await until("document.querySelector('#labVoice').src.startsWith('blob:')");
  assert.ok(await evaluate("fetch(document.querySelector('#labVoice').src).then(r=>r.blob()).then(b=>b.size > 0)"));
  assert.ok(await evaluate("document.querySelector('#labVoice').play().then(()=>true)"));
  await click('#navBeginner');
  assert.equal(await evaluate("document.querySelector('#labVoice').paused"), true);

  // Inject deterministic recognizer callbacks only for testing state transitions.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.SpeechRecognition = class {
      constructor() { window.testRecognition = this }
      start() {}
      stop() {}
      abort() { this.aborted = true }
    };
  ` });
  await send('Page.reload');
  await until("document.querySelectorAll('#catalog button').length === 48");
  await click('#navPronunciation');
  await evaluate(`document.querySelector('#threshold').value = 'strict';
    document.querySelector('#threshold').dispatchEvent(new Event('change'))`);
  await click('#record');
  await evaluate("testRecognition.onerror({error:'network'})");
  assert.equal(await evaluate("document.querySelector('#next').disabled"), true);
  await click('#record');
  await evaluate("window.oldRecognition = testRecognition");
  await click('[data-sound="29"]');
  assert.equal(await evaluate('oldRecognition.aborted'), true);
  await evaluate("oldRecognition.onresult({ resultIndex: 0, results: [[{transcript:'ship'}]] })");
  assert.equal(await evaluate("document.querySelector('#next').disabled"), true);
  await click('#record');
  await evaluate("testRecognition.onresult({ resultIndex: 0, results: [[{transcript:'then'}]] })");
  assert.equal(await evaluate("document.querySelector('#next').disabled"), false);
  await click('#next');
  assert.match(await evaluate("document.querySelector('#taskLabel').textContent"), /2\/3/);

  await evaluate(`localStorage.setItem('coach_free_done_v1', '{invalid');
    localStorage.setItem('erl-beginner', 'null')`);
  await send('Page.reload');
  await until("document.querySelector('#progress')?.textContent === '0/48'");
  await click('#navPronunciation');
  assert.deepEqual(exceptions, []);
  if (process.env.ERL_SCREENSHOT) {
    await click('[data-sound="28"]');
    await evaluate("document.querySelector('#guided3').scrollIntoView()");
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(process.env.ERL_SCREENSHOT, Buffer.from(data, 'base64'));
  }
  console.log('Chromium OK: 4 viewports, 37 aligned profiles decoded, 5 prioritized playback paths, pause/resume/loop, silent motion, local listening quiz, MediaRecorder with test device, progress and recognition state.');
} finally {
  socket.close();
}
