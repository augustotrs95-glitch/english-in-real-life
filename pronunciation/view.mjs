import { sample } from './motion.mjs';

export const diagrams = `
  <div class="mouth-views">
    <figure><svg viewBox="0 0 220 175" role="img" aria-label="Corte lateral da boca, com a frente à esquerda">
      <path d="M36 73 Q55 57 76 59 Q110 41 149 47 Q184 48 191 82 L195 150
        Q88 165 36 100Z" fill="#341d32"/>
      <path d="M34 73 Q60 64 76 59 Q119 37 161 51 Q180 56 191 82 L195 150"
        fill="none" stroke="#eab2a2" stroke-width="5"/>
      <path data-part="side-jaw" fill="none" stroke="#eab2a2" stroke-width="5"/>
      <path data-part="side-tongue" fill="#e7809d" stroke="#ffa9ba" stroke-width="2"/>
      <path d="M41 69 L51 66 L53 80 L42 83Z" fill="#fff4df"/>
      <path data-part="side-teeth" fill="#fff4df"/>
      <path data-part="side-lips" fill="none" stroke="#ef8c9f" stroke-width="7" stroke-linecap="round"/>
      <path data-part="side-glottis" fill="none" stroke="#92e9c8" stroke-width="3" stroke-linecap="round"/>
    </svg><figcaption>Lateral · língua, dentes e mandíbula</figcaption></figure>
    <figure><svg viewBox="0 0 220 175" role="img" aria-label="Vista frontal dos lábios, dentes e ponta da língua">
      <ellipse cx="110" cy="88" rx="92" ry="68" fill="#263e49"/>
      <path data-part="front-lips" fill="#341d32" stroke="#ef8c9f" stroke-width="8" stroke-linejoin="round"/>
      <path data-part="front-teeth" fill="#fff4df"/>
      <path data-part="front-tongue" fill="#e7809d" stroke="#ffa9ba" stroke-width="2"/>
    </svg><figcaption>Frontal · abertura e arredondamento</figcaption></figure>
  </div>`;

function draw(parts, p) {
  const opening = p.jaw * (1 - p.close);
  const lowerLip = 78 + opening;
  const lipX = 36 - p.round * 10;
  parts['side-jaw'].setAttribute('d', `M39 ${lowerLip} Q82 ${113 + opening} 156 ${125 + opening * .4} L195 150`);
  parts['side-teeth'].setAttribute('d', `M41 ${lowerLip + 1} L43 ${lowerLip - 5} L54 ${lowerLip - 3} L53 ${lowerLip + 7}Z`);
  parts['side-lips'].setAttribute('d', `M45 71 Q36 71 ${lipX} 77 M45 ${lowerLip + 5} Q36 ${lowerLip + 4} ${lipX} ${lowerLip}`);
  const gap = 6 * p.glottis;
  parts['side-glottis'].setAttribute('d', p.glottis === .5 ? '' :
    `M178 143 L${187 - gap} 145 M196 143 L${187 + gap} 145`);
  parts['side-tongue'].setAttribute('d', `M${p.tipX} ${p.tipY}
    C${p.tipX + 18} ${p.tipY - 7} ${p.bodyX - 21} ${p.bodyY} ${p.bodyX} ${p.bodyY}
    S${p.backX - 14} ${p.backY - 5} ${p.backX} ${p.backY}
    Q191 ${p.backY + 4} 186 ${126 + opening * .36}
    Q133 ${139 + opening * .3} ${p.tipX + 13} ${p.tipY + 12} Q${p.tipX - 5} ${p.tipY + 8} ${p.tipX} ${p.tipY}Z`);

  const width = 57 - 24 * p.round;
  const height = Math.max(1, opening * .46 + p.round * 8);
  const left = 110 - width;
  const right = 110 + width;
  const edge = 87 + height;
  const upper = 87 - height * .75;
  parts['front-lips'].setAttribute('d', `M${left} 87 Q80 ${upper} 110 ${upper - 2}
    Q140 ${upper} ${right} 87 Q141 ${edge + height * .55} 110 ${edge}
    Q79 ${edge + height * .55} ${left} 87Z`);
  parts['front-teeth'].setAttribute('d', height < 4 ? '' :
    `M${left + 12} 86 Q110 ${upper - 1} ${right - 12} 86 Q110 ${87 + Math.min(5, height / 2)} ${left + 12} 86Z`);
  const visibleTip = Math.max(0, (58 - p.tipX) / 28);
  const tongueTop = edge - height * visibleTip;
  parts['front-tongue'].setAttribute('d', height < 4 || visibleTip < .1 ? '' :
    `M${110 - width * .45} ${edge - 2} Q110 ${tongueTop - 5} ${110 + width * .45} ${edge - 2} Q110 ${edge + 5} ${110 - width * .45} ${edge - 2}Z`);
}

export function createMotion(container, motion, audio, { announce, onPlay, onState }) {
  const parts = Object.fromEntries([...container.querySelectorAll('[data-part]')].map(el => [el.dataset.part, el]));
  let frame;
  let previous;
  let position = 0;
  let playing = false;
  let pending = false;
  let speed = 1;
  let repeat = false;
  let revision = 0;
  const paint = () => draw(parts, sample(motion.frames, position / motion.duration));
  draw(parts, motion.focus);
  if (motion.clip) audio.src = new URL(`audio/${motion.clip}.mp3`, import.meta.url).href;

  function pause() {
    revision++;
    playing = false;
    pending = false;
    cancelAnimationFrame(frame);
    if (motion.clip) {
      position = audio.currentTime;
      audio.pause();
    }
    onState(false);
  }

  function tick(now) {
    if (!playing) return;
    if (motion.clip) {
      position = audio.currentTime;
    } else {
      position += (previous === undefined ? 0 : now - previous) * speed / 1000;
      if (position >= motion.duration) {
        if (!repeat) return finish();
        position %= motion.duration;
      }
    }
    previous = now;
    paint();
    frame = requestAnimationFrame(tick);
  }

  function finish() {
    pause();
    position = 0;
    draw(parts, motion.focus);
  }

  audio.onended = finish;
  audio.onerror = () => {
    if (!motion.clip || !audio.getAttribute('src')) return;
    finish();
    announce('Não foi possível carregar o áudio da demonstração.');
  };
  audio.onpause = () => {
    if (playing && audio.paused && !audio.ended) pause();
  };

  return {
    async toggle() {
      if (playing || pending) return pause();
      onPlay();
      if (motion.clip) {
        const version = ++revision;
        pending = true;
        onState(true);
        try {
          audio.playbackRate = speed;
          if (!position) audio.currentTime = 0;
          await audio.play();
        } catch {
          if (version === revision) {
            pause();
            announce('Não foi possível reproduzir o áudio.');
          }
          return;
        }
        if (version !== revision) return;
        pending = false;
      }
      playing = true;
      previous = undefined;
      onState(true);
      frame = requestAnimationFrame(tick);
    },
    pause,
    setSpeed(value) {
      speed = value;
      audio.playbackRate = value;
    },
    setRepeat(value) {
      repeat = value;
      audio.loop = value;
    },
    destroy() {
      pause();
      audio.onended = audio.onerror = audio.onpause = null;
      if (audio.hasAttribute('src')) {
        audio.removeAttribute('src');
        audio.load();
      }
    },
  };
}
