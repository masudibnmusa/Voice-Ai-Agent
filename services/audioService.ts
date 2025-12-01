// Utility to handle Base64 decoding and PCM playback
export class AudioService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // We initialize this lazily on user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000, // Gemini TTS often defaults to 24kHz
      });
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Decodes raw PCM data (16-bit little-endian)
  private async decodePCM(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error("AudioContext not initialized");

    const dataInt16 = new Int16Array(arrayBuffer);
    const numChannels = 1; // Gemini TTS output is mono
    const frameCount = dataInt16.length;
    
    // Create an AudioBuffer (using the context's sample rate or fixed 24000 if known)
    // IMPORTANT: Gemini TTS currently returns 24000Hz PCM
    const buffer = this.audioContext.createBuffer(numChannels, frameCount, 24000);

    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i] / 32768.0;
    }

    return buffer;
  }

  public async playAudio(base64Audio: string): Promise<void> {
    this.initContext();
    if (!this.audioContext || !this.gainNode) return;

    try {
      const arrayBuffer = this.base64ToArrayBuffer(base64Audio);
      const audioBuffer = await this.decodePCM(arrayBuffer);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);
      source.start();

      return new Promise((resolve) => {
        source.onended = () => resolve();
      });
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  public stopAll() {
    if (this.audioContext) {
      this.audioContext.suspend();
      this.audioContext = null;
    }
  }
}

export const audioService = new AudioService();