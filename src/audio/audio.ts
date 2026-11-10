import type { MapTheme } from "../game/maps";
import { seededRandom } from "../game/data";
export type SoundEffect =
  | "ui"
  | "roll"
  | "step"
  | "magic"
  | "treasure"
  | "portal"
  | "victory"
  | "land"
  | "transition";
export interface AudioPreferences {
  enabled: boolean;
  music: number;
  ambience: number;
  effects: number;
}
const DEFAULTS: AudioPreferences = {
  enabled: false,
  music: 0.36,
  ambience: 0.38,
  effects: 0.65,
};
export function readAudioPreferences(raw: string | null): AudioPreferences {
  try {
    const value = raw ? JSON.parse(raw) : {};
    const valid = (key: "music" | "ambience" | "effects") =>
      typeof value[key] === "number" && Number.isFinite(value[key])
        ? Math.max(0, Math.min(1, value[key]))
        : DEFAULTS[key];
    return {
      enabled: value.enabled === true,
      music: valid("music"),
      ambience: valid("ambience"),
      effects: valid("effects"),
    };
  } catch {
    return { ...DEFAULTS };
  }
}
export class GameAudio {
  preferences: AudioPreferences;
  context: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private effectsBus: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private ambience: AudioBufferSourceNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextChord = 0;
  private chord = 0;
  private theme: MapTheme;
  private noise: AudioBuffer | null = null;
  private rng = seededRandom(882);
  private mutedForVisibility = false;
  constructor(theme: MapTheme) {
    this.theme = theme;
    try {
      this.preferences = readAudioPreferences(
        localStorage.getItem("wilder-audio-v1"),
      );
    } catch {
      this.preferences = { ...DEFAULTS };
    }
    document.addEventListener("visibilitychange", () => {
      this.mutedForVisibility = document.hidden;
      this.applyVolumes();
    });
  }
  private setup() {
    if (this.context) return;
    this.context = new AudioContext();
    const ctx = this.context;
    this.master = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.ratio.value = 4;
    this.master.connect(compressor);
    compressor.connect(ctx.destination);
    this.musicBus = ctx.createGain();
    this.ambientBus = ctx.createGain();
    this.effectsBus = ctx.createGain();
    for (const bus of [this.musicBus, this.ambientBus, this.effectsBus])
      bus.connect(this.master);
    this.reverb = ctx.createConvolver();
    const impulse = ctx.createBuffer(2, ctx.sampleRate * 2.3, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const channel = impulse.getChannelData(ch);
      for (let i = 0; i < channel.length; i++)
        channel[i] =
          (this.rng() * 2 - 1) * Math.pow(1 - i / channel.length, 3) * 0.4;
    }
    this.reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.25;
    this.reverb.connect(wet);
    this.musicBus.connect(this.reverb);
    wet.connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const n = this.noise.getChannelData(0);
    let previous = 0;
    for (let i = 0; i < n.length; i++) {
      previous = (previous + (this.rng() * 2 - 1) * 0.02) / 1.02;
      n[i] = previous * 5;
    }
    this.applyVolumes();
    this.startAmbience();
    this.timer = setInterval(() => this.schedule(), 700);
  }
  async unlock() {
    if (!this.preferences.enabled) return;
    this.setup();
    await this.context!.resume();
    this.applyVolumes();
    this.schedule();
  }
  async setEnabled(enabled: boolean) {
    this.preferences.enabled = enabled;
    this.persist();
    if (enabled) await this.unlock();
    else this.applyVolumes();
  }
  setVolume(channel: "music" | "ambience" | "effects", value: number) {
    this.preferences[channel] = Math.max(0, Math.min(1, value));
    this.persist();
    this.applyVolumes();
  }
  private persist() {
    try {
      localStorage.setItem("wilder-audio-v1", JSON.stringify(this.preferences));
    } catch {}
  }
  private applyVolumes() {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.master!.gain.setTargetAtTime(
      this.preferences.enabled && !this.mutedForVisibility ? 0.8 : 0,
      now,
      0.2,
    );
    this.musicBus!.gain.setTargetAtTime(this.preferences.music, now, 0.2);
    this.ambientBus!.gain.setTargetAtTime(this.preferences.ambience, now, 0.2);
    this.effectsBus!.gain.setTargetAtTime(this.preferences.effects, now, 0.05);
  }
  setTheme(theme: MapTheme) {
    this.theme = theme;
    this.chord = 0;
    if (this.context) {
      this.nextChord = this.context.currentTime + 0.4;
      this.startAmbience();
    }
  }
  private startAmbience() {
    if (!this.context || !this.noise) return;
    this.ambience?.stop();
    const ctx = this.context;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value =
      this.theme.theme === "ocean"
        ? 850
        : this.theme.theme === "volcano"
          ? 160
          : this.theme.theme === "ice"
            ? 1300
            : 450;
    filter.Q.value = 0.45;
    const gain = ctx.createGain();
    gain.gain.value = this.theme.theme === "ocean" ? 0.075 : 0.036;
    const panner = ctx.createStereoPanner();
    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.ambientBus!);
    source.start();
    this.ambience = source;
  }
  private note(
    midi: number,
    start: number,
    duration: number,
    volume: number,
    type: OscillatorType = "sine",
    bus = this.musicBus,
  ) {
    if (!this.context || !bus) return;
    const ctx = this.context,
      osc = ctx.createOscillator(),
      gain = ctx.createGain(),
      pan = ctx.createStereoPanner();
    osc.type = type;
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    pan.pan.value = (this.rng() - 0.5) * 0.65;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, volume),
      start + Math.min(0.4, duration * 0.12),
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(pan);
    pan.connect(bus);
    osc.onended = () => {
      gain.disconnect();
      pan.disconnect();
    };
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }
  private schedule() {
    if (
      !this.context ||
      !this.preferences.enabled ||
      this.mutedForVisibility ||
      this.context.state !== "running"
    )
      return;
    const now = this.context.currentTime;
    if (this.nextChord > now + 1) return;
    const time = Math.max(now + 0.05, this.nextChord);
    const dark = ["dragon", "volcano", "mushroom"].includes(this.theme.theme),
      root =
        this.theme.theme === "ice"
          ? 57
          : this.theme.theme === "astral"
            ? 54
            : dark
              ? 50
              : this.theme.theme === "desert"
                ? 50
                : 48;
    const scale =
      this.theme.theme === "desert"
        ? [0, 1, 4, 5, 7, 8, 10]
        : dark
          ? [0, 2, 3, 5, 7, 8, 10]
          : [0, 2, 4, 5, 7, 9, 11];
    const degree = [0, 5, 3, 4][this.chord % 4];
    for (const offset of [0, 2, 4]) {
      const index = degree + offset;
      this.note(
        root + scale[index % 7] + Math.floor(index / 7) * 12,
        time,
        9,
        0.035,
        "sine",
      );
    }
    for (let i = 0; i < 4; i++) {
      const index = (degree + i * 2) % 7;
      this.note(
        root + 24 + scale[index],
        time + i * 2.2,
        2.6,
        0.022,
        "triangle",
      );
    }
    if (
      ["forest", "sakura"].includes(this.theme.theme) &&
      this.chord % 2 === 0
    ) {
      this.note(92, time + 3.4, 0.18, 0.014, "sine", this.ambientBus);
      this.note(96, time + 3.7, 0.15, 0.01, "sine", this.ambientBus);
    }
    this.chord++;
    this.nextChord = time + 8.8;
  }
  private noiseEffect(
    start: number,
    duration: number,
    volume: number,
    frequency: number,
  ) {
    if (!this.context || !this.noise) return;
    const ctx = this.context,
      source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = this.noise;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 0.8;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.effectsBus!);
    source.start(start, this.rng() * 2);
    source.stop(start + duration);
    source.onended = () => {
      filter.disconnect();
      gain.disconnect();
    };
  }
  play(effect: SoundEffect) {
    if (
      !this.preferences.enabled ||
      !this.context ||
      this.context.state !== "running"
    )
      return;
    const now = this.context.currentTime;
    if (effect === "ui") {
      this.note(79, now, 0.09, 0.035, "sine", this.effectsBus);
      return;
    }
    if (effect === "step") {
      this.noiseEffect(
        now,
        0.09,
        0.18,
        this.theme.theme === "ice"
          ? 2200
          : this.theme.theme === "desert"
            ? 1300
            : 650,
      );
      this.note(
        this.theme.theme === "ice" ? 67 : 43,
        now,
        0.08,
        0.05,
        "sine",
        this.effectsBus,
      );
      return;
    }
    if (effect === "roll") {
      for (let i = 0; i < 7; i++)
        this.noiseEffect(now + i * 0.065, 0.055, 0.2, 700 + i * 140);
      return;
    }
    if (effect === "land") {
      this.noiseEffect(now, 0.16, 0.22, 350);
      this.note(40, now, 0.2, 0.07, "sine", this.effectsBus);
      return;
    }
    if (effect === "portal") {
      this.noiseEffect(now, 0.8, 0.25, 1800);
      for (let i = 0; i < 8; i++)
        this.note(
          55 + i * 3,
          now + i * 0.075,
          0.7,
          0.045,
          "sine",
          this.effectsBus,
        );
      return;
    }
    const notes =
      effect === "victory"
        ? [60, 64, 67, 72, 76, 79, 84]
        : effect === "treasure"
          ? [76, 79, 83, 88]
          : effect === "transition"
            ? [60, 67, 72, 79, 84]
            : [69, 76, 81, 88];
    notes.forEach((midi, i) =>
      this.note(
        midi,
        now + i * (effect === "victory" ? 0.14 : 0.08),
        effect === "victory" ? 1.7 : 0.65,
        0.07,
        "sine",
        this.effectsBus,
      ),
    );
  }
  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.ambience?.stop();
    void this.context?.close();
  }
}
