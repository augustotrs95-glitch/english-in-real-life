import { motions } from './motion.mjs';
import { diagrams, createMotion } from './view.mjs';
import { setupRecording } from './recording.mjs';

const localWords = new Set(['thin', 'tin', 'then', 'den', 'ship', 'sheep', 'bad', 'bed']);

export function createLab(root, { locale, beforeMedia }) {
  const $ = selector => root.querySelector(selector);
  let motion;
  let recording;
  let stopModel = () => {};

  function pause() {
    stopModel();
    motion?.pause();
    recording?.cancel();
    $('#labVoice')?.pause();
    window.speechSynthesis?.cancel();
  }

  function render(sound, material) {
    stopModel();
    motion?.destroy();
    recording?.destroy();
    const profile = motions[sound.ipa];
    root.innerHTML = `
      <h3>Laboratório de pronúncia</h3>
      <p id="labCue"></p>
      <p id="labReference" class="secondary"></p>
      <p id="labCorrection" class="secondary"></p>
      <div class="lab-buttons">
        <button id="labNarrate">Ouvir orientação em português</button>
      </div>
      <h4>Como a boca se move</h4>
      ${diagrams}
      <p class="hint" id="labCaption"></p>
      <div class="lab-buttons">
        <button id="labPlay" class="primary">Reproduzir</button>
        <label>Velocidade <select id="labSpeed">
          <option value="1">Normal</option><option value=".5">Câmera lenta (0,5×)</option>
        </select></label>
        <label class="lab-repeat"><input id="labRepeat" type="checkbox"> Repetir</label>
      </div>
      <audio id="labDemo" preload="none"></audio>
      <audio id="labListening" preload="none"></audio>
      <p id="labMediaStatus" role="status"></p>
      <h4>Escute e compare</h4>
      <div class="lab-buttons">
        <button id="labWord" lang="en"></button>
        <button id="labContrast" lang="en"></button>
        <button id="labBoth">Ouvir as duas</button>
        <button id="labSurprise">Palavra surpresa</button>
      </div>
      <div class="lab-buttons" aria-label="Qual palavra você ouviu?">
        <button id="labGuessWord" lang="en" disabled></button>
        <button id="labGuessContrast" lang="en" disabled></button>
      </div>
      <p id="labAnswer" role="status">Escute a palavra surpresa antes de escolher.</p>
      <p class="hint">Compare o que ouviu. Alguns exemplos diferem em mais de um som.</p>
      <h4>Compare sua voz</h4>
      <p class="hint">Repita o modelo algumas vezes. Ao gravar, seu áudio fica apenas nesta página.</p>
      <div class="lab-buttons">
        <button id="labRecord">Gravar</button>
        <button id="labStop" disabled>Parar</button>
      </div>
      <p id="labRecordingStatus" role="status"></p>
      <audio id="labVoice" controls aria-label="Sua gravação" hidden></audio>
      <details><summary>Observações sobre o sotaque e referências</summary>
        <p id="labAccent"></p>
        <p id="labDetail"></p>
        <div class="lab-buttons">
          <a id="labVideo" target="_blank" rel="noopener">Buscar demonstrações em vídeo ↗</a>
          <a href="https://www.englishclub.com/pronunciation/phonemic-chart.php">Quadro fonético ↗</a>
        </div>
      </details>`;

    $('#labCue').textContent = material.cue;
    $('#labReference').textContent = `Referência aproximada em português: ${material.reference}`;
    $('#labCorrection').textContent = `Erro comum: ${material.correction}`;
    $('#labDetail').textContent = material.detail || 'A voz dos exercícios depende das vozes instaladas no dispositivo.';
    $('#labVideo').href = 'https://www.youtube.com/results?search_query=' +
      encodeURIComponent(`English pronunciation ${sound.word} ${sound.ipa} mouth position`);
    updateLocale();

    const voicing = sound.ipa === '/θ/' ? ' O TH é produzido sem vibração da voz.'
      : sound.ipa === '/ð/' ? ' O TH é produzido com vibração da voz.' : '';
    const throat = ['/h/', '[ʔ]'].includes(sound.ipa) ? ' As linhas verdes indicam a abertura da glote.' : '';
    $('#labCaption').textContent = 'As duas vistas mostram posições esquemáticas.' + voicing + throat +
      (profile.clip ? ` Áudio sincronizado: “${profile.clip}”, voz sintética americana.`
        : ' Demonstração visual. O modelo sonoro está no exercício de escuta.');
    const play = $('#labPlay');
    const mediaStatus = $('#labMediaStatus');
    const voice = $('#labVoice');
    const listening = $('#labListening');
    let modelRevision = 0;
    stopModel = () => {
      modelRevision++;
      const cancel = listening.onpause;
      listening.onpause = listening.onended = listening.onerror = null;
      listening.pause();
      cancel?.();
    };
    motion = createMotion(root, profile, $('#labDemo'), {
      announce: message => { mediaStatus.textContent = message; },
      onPlay: () => {
        beforeMedia();
        stopModel();
        recording.cancel();
        voice.pause();
        window.speechSynthesis?.cancel();
        mediaStatus.textContent = '';
      },
      onState: active => {
        play.textContent = active ? 'Pausar' : 'Reproduzir';
      },
    });
    play.onclick = () => motion.toggle();
    $('#labSpeed').onchange = event => motion.setSpeed(Number(event.target.value));
    $('#labRepeat').onchange = event => motion.setRepeat(event.target.checked);
    recording = setupRecording({
      start: $('#labRecord'), stop: $('#labStop'), play: voice, status: $('#labRecordingStatus'),
      onCapture: () => {
        beforeMedia();
        stopModel();
        motion.pause();
        voice.pause();
        window.speechSynthesis?.cancel();
      },
    });
    voice.onplay = () => {
      beforeMedia();
      stopModel();
      recording.cancel();
      motion.pause();
      window.speechSynthesis?.cancel();
    };

    const words = [sound.word, sound.contrast];
    const guess = [$('#labGuessWord'), $('#labGuessContrast')];
    const answer = $('#labAnswer');
    let round = 0;
    let correct;
    const clearRound = () => {
      round++;
      guess.forEach(button => { button.disabled = true; });
      answer.textContent = 'Escute a palavra surpresa antes de escolher.';
    };
    function speak(text, language = locale(), handlers = {}) {
      beforeMedia();
      pause();
      mediaStatus.textContent = '';
      if (language === 'en-US' && localWords.has(text)) {
        const version = ++modelRevision;
        listening.src = new URL(`audio/${text}.mp3`, import.meta.url).href;
        listening.playbackRate = Number($('#labSpeed').value);
        listening.onpause = () => { if (!listening.ended) handlers.cancel?.(); };
        listening.onended = () => {
          listening.onpause = null;
          handlers.end?.();
        };
        listening.play().catch(() => {
          if (version !== modelRevision) return;
          mediaStatus.textContent = 'Não foi possível reproduzir o áudio de escuta.';
          handlers.error?.();
        });
        return;
      }
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        mediaStatus.textContent = 'A síntese de voz está indisponível neste navegador.';
        handlers.error?.();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = Number($('#labSpeed').value) === .5 ? .6 : .9;
      const voices = speechSynthesis.getVoices();
      const lang = language.toLowerCase();
      utterance.voice = voices.find(voice => voice.lang.toLowerCase() === lang) ||
        voices.find(voice => voice.lang.toLowerCase().split('-')[0] === lang.split('-')[0]) || null;
      utterance.onend = handlers.end;
      utterance.onerror = event => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
          handlers.cancel?.();
          return;
        }
        mediaStatus.textContent = 'A voz do dispositivo não conseguiu reproduzir o modelo.';
        handlers.error?.();
      };
      speechSynthesis.speak(utterance);
    }

    const model = [$('#labWord'), $('#labContrast')];
    words.forEach((word, index) => {
      model[index].textContent = '▶ ' + word;
      model[index].onclick = () => { clearRound(); speak(word); };
      guess[index].textContent = word;
      guess[index].onclick = () => {
        const result = index === correct ? 'Isso mesmo. ' : 'Tente outro exemplo. ';
        clearRound();
        answer.textContent = result + `Você ouviu “${words[correct]}”.`;
        $('#labSurprise').focus();
      };
    });
    $('#labNarrate').onclick = () => {
      clearRound();
      speak([material.cue, material.detail].filter(Boolean).join(' '), 'pt-BR');
    };
    $('#labBoth').onclick = () => { clearRound(); speak(words.join(', ')); };
    $('#labSurprise').onclick = () => {
      clearRound();
      const id = round;
      correct = Math.random() < .5 ? 0 : 1;
      answer.textContent = 'Reproduzindo a palavra…';
      speak(words[correct], locale(), {
        end: () => {
          if (id !== round) return;
          answer.textContent = 'Qual palavra você ouviu?';
          guess.forEach(button => { button.disabled = false; });
        },
        error: () => {
          if (id === round) answer.textContent = 'Áudio indisponível. Tente ouvir novamente.';
        },
        cancel: () => { if (id === round) clearRound(); },
      });
    };
  }

  function updateLocale() {
    const note = $('#labAccent');
    if (!note) return;
    const accents = {
      'en-AU': 'Em muitos sotaques australianos, o R histórico fica mudo antes de pausa ou consoante.',
      'en-US': 'Em muitos sotaques americanos, o R histórico é pronunciado nessas posições.',
      'en-GB': 'As vozes britânicas variam por região. Muitos sotaques não pronunciam o R final antes de pausa.',
    };
    note.textContent = (accents[locale()] || accents['en-AU']) + ' As vogais e o ritmo também variam entre falantes.';
  }

  return { render, pause, updateLocale };
}
