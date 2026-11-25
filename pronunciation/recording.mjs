export function setupRecording({ start, stop, play, status, onCapture }) {
  let revision = 0;
  let recorder;
  let stream;
  let timer;
  let url;

  function release() {
    clearTimeout(timer);
    stream?.getTracks().forEach(track => track.stop());
    stream = undefined;
  }

  function revoke() {
    play.pause();
    play.removeAttribute('src');
    play.hidden = true;
    if (url) URL.revokeObjectURL(url);
    url = undefined;
  }

  function idle(message) {
    start.disabled = false;
    stop.disabled = true;
    stop.textContent = 'Parar';
    status.textContent = message;
  }

  start.onclick = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      status.textContent = 'Gravação indisponível neste navegador. Tente em HTTPS ou localhost.';
      return;
    }
    stop.disabled = false;
    start.disabled = true;
    stop.textContent = 'Cancelar';
    status.textContent = 'Aguardando permissão do microfone…';
    onCapture();
    const version = ++revision;

    try {
      const acquired = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (version !== revision) {
        acquired.getTracks().forEach(track => track.stop());
        return;
      }
      stream = acquired;
      const capture = new MediaRecorder(stream);
      recorder = capture;
      const chunks = [];
      capture.ondataavailable = event => {
        if (event.data.size) chunks.push(event.data);
      };
      capture.onerror = () => {
        if (version !== revision) return;
        revision++;
        release();
        recorder = undefined;
        idle('A gravação foi interrompida. Tente novamente.');
      };
      capture.onstop = () => {
        if (version !== revision) return;
        release();
        recorder = undefined;
        if (!chunks.length) return idle('Nenhum áudio foi capturado. Tente novamente.');
        revoke();
        url = URL.createObjectURL(new Blob(chunks, { type: capture.mimeType || chunks[0].type }));
        play.src = url;
        play.hidden = false;
        idle('Gravação pronta. Ouça sua voz e compare com o modelo.');
      };
      capture.start();
      stop.textContent = 'Parar';
      status.textContent = 'Gravando por até 15 segundos…';
      timer = setTimeout(end, 15000);
    } catch {
      if (version !== revision) return;
      release();
      recorder = undefined;
      idle('Microfone indisponível. Confira a permissão e a conexão do dispositivo.');
    }
  };

  function end() {
    if (recorder?.state === 'recording') {
      recorder.stop();
      clearTimeout(timer);
      stop.disabled = true;
      status.textContent = 'Preparando a gravação…';
    } else {
      cancel();
    }
  }

  function cancel() {
    if (!start.disabled) return;
    revision++;
    if (recorder?.state === 'recording') recorder.stop();
    recorder = undefined;
    release();
    idle('Gravação cancelada.');
  }

  stop.onclick = end;
  return { cancel, destroy() { cancel(); revoke(); } };
}
