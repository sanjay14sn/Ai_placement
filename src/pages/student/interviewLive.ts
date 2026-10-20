export type TranscriptTurn = { role: 'interviewer' | 'candidate'; text: string };

type Handlers = {
  onReady: () => void;
  onAiSpeaking: () => void;
  onListening: () => void;
  onTranscript: (turns: TranscriptTurn[]) => void;
  onError: (message: string) => void;
};

const wsUrl = (token: string) =>
  `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(token)}`;

const mergeText = (current: string, next: string) => {
  const incoming = next.trim();
  if (!incoming) return current;
  if (!current) return incoming;
  if (incoming.startsWith(current)) return incoming;
  if (current.endsWith(incoming)) return current;
  return `${current} ${incoming}`.replace(/\s+/g, ' ').trim();
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const downsample = (input: Float32Array, inputRate: number, outputRate: number) => {
  if (inputRate === outputRate) return input;
  const ratio = inputRate / outputRate;
  const length = Math.floor(input.length / ratio);
  const output = new Float32Array(length);
  for (let i = 0; i < length; i += 1) output[i] = input[Math.floor(i * ratio)];
  return output;
};

const floatToPcm = (input: Float32Array) => {
  const pcm = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return new Uint8Array(pcm.buffer);
};

export type LiveInterview = {
  model: string;
  sendText: (text: string) => boolean;
  stop: () => TranscriptTurn[];
};

export const connectLiveInterview = async ({
  token,
  models,
  instructions,
  stream,
  refreshToken,
  video,
  handlers,
}: {
  token: string;
  models: string[];
  instructions: string;
  stream: MediaStream;
  refreshToken: () => Promise<string>;
  video: HTMLVideoElement | null;
  handlers: Handlers;
}): Promise<LiveInterview> => {
  const turns: TranscriptTurn[] = [];
  let interviewer = '';
  let candidate = '';
  let closed = false;
  let socket: WebSocket | null = null;
  let captureContext: AudioContext | null = null;
  let playContext: AudioContext | null = null;
  let processor: ScriptProcessorNode | null = null;
  let frameTimer = 0;
  let nextPlay = 0;
  const playing: AudioBufferSourceNode[] = [];
  let activeModel = models[0] || 'gemini-3.8-live';
  let currentToken = token;
  let ready = false;

  const publish = () => {
    const snapshot = [...turns];
    if (interviewer) snapshot.push({ role: 'interviewer', text: interviewer });
    if (candidate) snapshot.push({ role: 'candidate', text: candidate });
    handlers.onTranscript(snapshot.filter((turn) => turn.text.trim()));
  };

  const flush = () => {
    if (interviewer.trim()) turns.push({ role: 'interviewer', text: interviewer.trim() });
    if (candidate.trim()) turns.push({ role: 'candidate', text: candidate.trim() });
    interviewer = '';
    candidate = '';
    publish();
  };

  const stopPlayback = () => {
    playing.forEach((source) => {
      try { source.stop(); } catch { /* already stopped */ }
    });
    playing.length = 0;
    nextPlay = 0;
  };

  const playPcm = async (base64: string) => {
    if (!playContext) playContext = new AudioContext({ sampleRate: 24000 });
    if (playContext.state === 'suspended') await playContext.resume();
    const bytes = fromBase64(base64);
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const floats = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i += 1) floats[i] = pcm[i] / 32768;
    const outputRate = playContext.sampleRate;
    let channel = floats;
    if (outputRate !== 24000) {
      const ratio = outputRate / 24000;
      channel = new Float32Array(Math.max(1, Math.floor(floats.length * ratio)));
      for (let i = 0; i < channel.length; i += 1) {
        const position = i / ratio;
        const index = Math.min(Math.floor(position), floats.length - 1);
        const next = Math.min(index + 1, floats.length - 1);
        const mix = position - index;
        channel[i] = floats[index] * (1 - mix) + floats[next] * mix;
      }
    }
    const buffer = playContext.createBuffer(1, channel.length, outputRate);
    buffer.copyToChannel(channel, 0);
    const source = playContext.createBufferSource();
    source.buffer = buffer;
    source.connect(playContext.destination);
    const now = playContext.currentTime;
    if (nextPlay < now) nextPlay = now;
    source.start(nextPlay);
    nextPlay += buffer.duration;
    playing.push(source);
    source.onended = () => {
      const index = playing.indexOf(source);
      if (index >= 0) playing.splice(index, 1);
    };
    handlers.onAiSpeaking();
  };

  const sendVideoFrame = () => {
    if (!video || !socket || socket.readyState !== WebSocket.OPEN || video.readyState < 2) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
    if (!data) return;
    socket.send(JSON.stringify({
      realtimeInput: { video: { data, mimeType: 'image/jpeg' } },
    }));
  };

  const startCapture = () => {
    const audioContext = new AudioContext();
    captureContext = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const node = audioContext.createScriptProcessor(4096, 1, 1);
    processor = node;
    const silent = audioContext.createGain();
    silent.gain.value = 0;
    node.onaudioprocess = (event) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const channel = event.inputBuffer.getChannelData(0);
      const pcm = floatToPcm(downsample(channel, audioContext.sampleRate, 16000));
      socket.send(JSON.stringify({
        realtimeInput: {
          audio: { data: toBase64(pcm), mimeType: 'audio/pcm;rate=16000' },
        },
      }));
    };
    source.connect(node);
    node.connect(silent);
    silent.connect(audioContext.destination);
  };

  const handleMessage = async (raw: string) => {
    const message = JSON.parse(raw);
    if (message.error?.message) {
      if (!ready) throw new Error(message.error.message);
      handlers.onError(message.error.message);
      return;
    }
    if (message.setupComplete) {
      ready = true;
      startCapture();
      frameTimer = window.setInterval(sendVideoFrame, 1000);
      socket?.send(JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text: 'Begin the interview now. Greet me and ask the first question.' }] }],
          turnComplete: true,
        },
      }));
      handlers.onReady();
      return;
    }
    const content = message.serverContent;
    if (!content) return;
    if (content.interrupted) {
      stopPlayback();
      flush();
      handlers.onListening();
    }
    const parts = content.modelTurn?.parts || [];
    for (const part of parts) {
      const inline = part.inlineData || part.inline_data;
      if (inline?.data) await playPcm(inline.data);
    }
    if (content.outputTranscription?.text) {
      interviewer = mergeText(interviewer, content.outputTranscription.text);
      publish();
    }
    if (content.inputTranscription?.text) {
      candidate = mergeText(candidate, content.inputTranscription.text);
      handlers.onListening();
      publish();
    }
    if (content.turnComplete) {
      flush();
      handlers.onListening();
    }
  };

  const openSocket = (model: string, accessToken: string) => new Promise<void>((resolve, reject) => {
    activeModel = model;
    let settled = false;
    const connection = new WebSocket(wsUrl(accessToken));
    socket = connection;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (error) reject(error);
      else resolve();
    };
    const timer = window.setTimeout(() => {
      connection.close();
      finish(new Error('Gemini voice session timed out'));
    }, 12000);
    connection.onopen = () => {
      connection.send(JSON.stringify({
        setup: {
          model: `models/${model}`,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Leda' } },
              languageCode: 'en-IN',
            },
          },
          systemInstruction: { parts: [{ text: instructions }] },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          realtimeInputConfig: {
            activityHandling: 'NO_INTERRUPTION',
            automaticActivityDetection: { silenceDurationMs: 1200, endOfSpeechSensitivity: 'END_SENSITIVITY_LOW' },
          },
        },
      }));
    };
    connection.onmessage = async (event) => {
      const raw = typeof event.data === 'string' ? event.data : await event.data.text();
      if (raw.includes('setupComplete')) finish();
      try {
        await handleMessage(raw);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not read the interviewer response';
        if (!settled) finish(new Error(message));
        else handlers.onError(message);
      }
    };
    connection.onerror = () => finish(new Error('Could not connect to Gemini voice'));
    connection.onclose = () => {
      if (!settled) finish(new Error('Gemini closed the voice session before it started'));
      else if (!closed) handlers.onError('The voice session ended');
    };
  });

  const attempt = async () => {
    let lastError = 'Could not connect to Gemini voice';
    for (let index = 0; index < models.length; index += 1) {
      try {
        await openSocket(models[index], currentToken);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError;
        socket?.close();
        socket = null;
        if (index < models.length - 1) {
          currentToken = await refreshToken();
        }
      }
    }
    throw new Error(lastError);
  };

  await attempt();

  return {
    model: activeModel,
    sendText: (text: string) => {
      const answer = text.trim();
      if (!answer || closed || !socket || socket.readyState !== WebSocket.OPEN) return false;
      stopPlayback();
      flush();
      turns.push({ role: 'candidate', text: answer });
      publish();
      socket.send(JSON.stringify({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text: answer }] }],
          turnComplete: true,
        },
      }));
      handlers.onAiSpeaking();
      return true;
    },
    stop: () => {
      closed = true;
      window.clearInterval(frameTimer);
      flush();
      stopPlayback();
      processor?.disconnect();
      captureContext?.close();
      playContext?.close();
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
        socket.close();
      }
      return turns;
    },
  };
};
