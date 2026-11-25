import { sounds, materialByTarget } from './content.mjs';
import { createLab } from './lab.mjs';

const $ = selector => document.querySelector(selector);
const completionKey = 'coach_free_done_v1';
function loadCompletion() {
  try {
    const saved = JSON.parse(localStorage.getItem(completionKey));
    return new Set(Array.isArray(saved) ? saved.filter(index => Number.isInteger(index) && sounds[index]) : []);
  } catch {
    return new Set();
  }
}

const completed = loadCompletion();
const locale = $('#locale');
const threshold = $('#threshold');
const result = $('#result');
const record = $('#record');
const next = $('#next');
const micHint = $('#micHint');
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let current = 0;
let stage = 0;
let active;
let timer;
let assessed = null;
const lab = createLab($('#guided3'), { locale: () => locale.value, beforeMedia: cancelRecognition });

const sound = () => sounds[current];
function task() {
  const { word, contrast, sentence } = sound();
  return [
    [word, 'PALAVRA', 'Diga somente esta palavra. Compare com o modelo.'],
    [`${word}, ${contrast}`, 'CONTRASTE', 'Diga as duas palavras com uma pausa curta.'],
    [sentence, 'FRASE', 'Leia a frase inteira, com ritmo natural.'],
  ][stage];
}

function renderCatalog() {
  const query = $('#search').value.trim().toLowerCase();
  const catalog = $('#catalog');
  const selected = document.activeElement?.dataset.sound;
  catalog.replaceChildren();
  sounds.forEach((entry, index) => {
    if (!`${entry.ipa} ${entry.title} ${entry.word}`.toLowerCase().includes(query)) return;
    const button = document.createElement('button');
    button.className = 'item';
    button.classList.toggle('active', index === current);
    button.classList.toggle('done', completed.has(index));
    button.dataset.sound = index;
    if (index === current) button.setAttribute('aria-current', 'true');
    const label = document.createElement('span');
    label.textContent = `${entry.ipa} · ${entry.title}`;
    const details = document.createElement('small');
    details.textContent = `${entry.word} · ${entry.group}${completed.has(index) ? ' · concluído' : ''}`;
    label.append(document.createElement('br'), details);
    button.append(label);
    button.onclick = () => {
      cancelRecognition();
      lab.pause();
      current = index;
      stage = 0;
      renderTarget();
      $('#ipa').focus();
    };
    catalog.append(button);
  });
  if (!catalog.children.length) catalog.textContent = 'Nenhum som encontrado.';
  if (selected !== undefined) catalog.querySelector(`[data-sound="${selected}"]`)?.focus({ preventScroll: true });
  $('#progress').textContent = completed.size + '/' + sounds.length;
}

function renderTarget() {
  const entry = sound();
  $('#lessonNum').textContent = `ALVO ${String(current + 1).padStart(2, '0')} / ${sounds.length}`;
  $('#lessonGroup').textContent = entry.group;
  $('#ipa').textContent = entry.ipa;
  $('#soundTitle').textContent = entry.title;
  $('#description').textContent = entry.guide;
  lab.render(entry, materialByTarget[entry.ipa]);
  renderTask();
  renderCatalog();
}

function paragraph(text, className = '') {
  const node = document.createElement('p');
  node.textContent = text;
  node.className = className;
  return node;
}

function renderTask() {
  assessed = null;
  const [text, label, hint] = task();
  $('#taskLabel').textContent = `ETAPA ${stage + 1}/3 · ${label}`;
  $('#target').textContent = text;
  $('#target').lang = locale.value;
  $('#translation').textContent = hint;
  next.textContent = stage === 2 ? 'Concluir e próximo som →' : 'Próxima etapa →';
  result.className = 'result';
  result.replaceChildren(paragraph('Ouça, fale e confira o resultado.', 'hint'));
  micHint.textContent = 'Toque no microfone, autorize e fale uma vez.';
  updateAdvance();
}

function canAdvance() {
  return assessed !== null && assessed !== 'unavailable' && (threshold.value !== 'strict' || assessed === 'exact');
}

function updateAdvance() {
  next.disabled = Boolean(active) || !canAdvance();
  $('#retry').disabled = Boolean(active) || assessed === null;
  const manual = $('#manualContinue');
  if (manual) manual.hidden = threshold.value === 'strict';
  $('#step2').classList.toggle('active', Boolean(active));
  $('#step3').classList.toggle('active', assessed !== null && !active);
}

const normalize = text => text.toLowerCase().replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, ' ').trim();

function feedback(transcript) {
  const expected = task()[0];
  const exact = normalize(expected) === normalize(transcript);
  assessed = exact ? 'exact' : 'different';
  result.className = exact ? 'result good' : 'result warn';
  const title = document.createElement('h3');
  title.textContent = exact ? 'Palavras reconhecidas' : 'Transcrição diferente';
  result.replaceChildren(title,
    paragraph('Expressão esperada — ' + expected),
    paragraph('O navegador entendeu — ' + transcript),
    paragraph(exact ? 'Compare a articulação e o ritmo com o modelo.'
      : 'Ouça e compare novamente. ' + materialByTarget[sound().ipa].cue),
    paragraph('O reconhecimento compara palavras. A comparação da sua voz com o modelo fica a seu critério.', 'tiny'));
  const expectedWords = normalize(expected).split(' ');
  const heardWords = normalize(transcript).split(' ');
  const chips = document.createElement('div');
  expectedWords.forEach((word, index) => {
    const chip = document.createElement('span');
    const match = word === heardWords[index];
    chip.className = match ? 'wordchip' : 'wordchip bad';
    chip.textContent = word + (match ? ' ✓' : ' ?');
    chips.append(chip);
  });
  result.insertBefore(chips, result.children[3]);
  updateAdvance();
  micHint.textContent = next.disabled ? 'Repita a expressão para avançar no modo estrito.' : 'Você pode repetir ou avançar.';
}

function fail(message) {
  assessed = 'unavailable';
  result.className = 'result warn';
  result.replaceChildren(paragraph(message),
    paragraph('Você pode ouvir o modelo e usar a gravação do laboratório para praticar.', 'tiny'));
  const manual = document.createElement('button');
  manual.id = 'manualContinue';
  manual.textContent = 'Continuar sem reconhecimento';
  manual.onclick = () => {
    if (threshold.value === 'strict') return;
    assessed = 'manual';
    manual.replaceWith(paragraph('Avanço manual selecionado.', 'tiny'));
    updateAdvance();
    next.focus();
  };
  result.append(manual);
  micHint.textContent = 'Tente novamente quando estiver pronto.';
  updateAdvance();
}

function releaseRecognition() {
  const previous = active;
  active = undefined;
  clearTimeout(timer);
  record.disabled = false;
  record.textContent = '🎙 Falar e conferir';
  updateAdvance();
  return previous;
}

function cancelRecognition() {
  if (!active) return;
  try { releaseRecognition().abort(); } catch {}
  micHint.textContent = 'Reconhecimento cancelado.';
}

function stopRecognition() {
  const recognition = active;
  if (!recognition) return;
  record.disabled = true;
  record.textContent = 'Encerrando…';
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (active !== recognition) return;
    cancelRecognition();
    fail('O navegador demorou a devolver a transcrição.');
  }, 3000);
  try { recognition.stop(); } catch {
    cancelRecognition();
    fail('Não foi possível encerrar o reconhecimento.');
  }
}

function startRecognition() {
  lab.pause();
  assessed = null;
  if (!Recognition || !window.isSecureContext) return fail('Reconhecimento indisponível aqui. Use um navegador compatível em HTTPS.');
  try {
    const recognition = new Recognition();
    active = recognition;
    recognition.lang = locale.value;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = event => {
      if (active !== recognition) return;
      const transcript = event.results[event.resultIndex]?.[0]?.transcript;
      if (!transcript?.trim()) return;
      releaseRecognition();
      feedback(transcript);
    };
    recognition.onerror = event => {
      if (active !== recognition) return;
      const messages = {
        'not-allowed': 'O navegador não recebeu permissão para usar o microfone.',
        'no-speech': 'O navegador não detectou fala.',
        'audio-capture': 'O microfone está indisponível.',
        network: 'O serviço de reconhecimento do navegador retornou um erro de rede.',
      };
      releaseRecognition();
      fail(messages[event.error] || 'Não foi possível obter uma transcrição.');
    };
    recognition.onend = () => {
      if (active !== recognition) return;
      releaseRecognition();
      fail('O navegador encerrou o reconhecimento sem devolver texto.');
    };
    recognition.start();
    timer = setTimeout(stopRecognition, 12000);
    record.textContent = '■ Parar reconhecimento';
    micHint.textContent = 'Ouvindo por até 12 segundos.';
    updateAdvance();
  } catch {
    releaseRecognition();
    fail('Não foi possível iniciar o reconhecimento.');
  }
}

$('#listen').onclick = () => {
  cancelRecognition();
  lab.pause();
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    micHint.textContent = 'A síntese de voz está indisponível neste navegador.';
    return;
  }
  const utterance = new SpeechSynthesisUtterance(task()[0]);
  utterance.lang = locale.value;
  utterance.rate = .85;
  utterance.onerror = event => {
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      micHint.textContent = 'A voz do dispositivo não conseguiu ler a expressão.';
    }
  };
  window.speechSynthesis.speak(utterance);
};
record.onclick = () => active ? stopRecognition() : startRecognition();
$('#retry').onclick = () => {
  cancelRecognition();
  lab.pause();
  renderTask();
  record.focus();
};
next.onclick = () => {
  if (!canAdvance() || active) return;
  lab.pause();
  if (stage < 2) {
    stage++;
    renderTask();
    $('#target').focus();
    return;
  }
  completed.add(current);
  try { localStorage.setItem(completionKey, JSON.stringify([...completed])); } catch {}
  current = (current + 1) % sounds.length;
  stage = 0;
  renderTarget();
  $('#ipa').focus();
};
$('#search').oninput = renderCatalog;
threshold.onchange = updateAdvance;
locale.onchange = () => {
  cancelRecognition();
  lab.pause();
  lab.updateLocale();
  renderTask();
};
document.addEventListener('coursechange', () => {
  cancelRecognition();
  lab.pause();
});
window.addEventListener('pagehide', () => {
  cancelRecognition();
  lab.pause();
});
$('#ipa').tabIndex = -1;
$('#target').tabIndex = -1;
$('#status').textContent = Recognition && window.isSecureContext
  ? 'Reconhecimento disponível' : 'Reconhecimento indisponível';
renderTarget();
