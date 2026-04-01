<div align="center">

**AudioBookConvert v2**

**A light-weight, powerful, and cinematic single-page application for converting massive text documents into rich, natural audiobooks locally in your browser.**

**Solves the "fake sounding" robot voices by hijacking the state-of-the-art Azure neural models.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npm install
npm run dev
```

**Works on Mac, Windows, and Linux entirely inside your browser.**

<br>

*"If you want to read a 500-page PDF on your commute, this WILL build the audiobook for you. No bs."*

*"I've used countless subscription services for TTS — this produces the same quality audio for completely free."*

<br>

[Why I Built This](#why-i-built-this) · [How It Works](#how-it-works) · [Features](#features) · [Getting Started](#getting-started)

</div>

---

## Why I Built This

I'm an avid reader who wanted to consume long articles, textbooks, and documents while commuting or working out. Standard text-to-speech tools sound generic and robotic, and the truly natural-sounding "premium" AI voices are locked behind expensive SaaS subscriptions that charge by the character.

I realized I didn't need to pay an AI wrapper company. I just needed to access the foundational models directly.

So I built AudioBookConvert. The complexity is in the background: managing WebSocket dropouts, slicing huge documents into parallel chunks, processing audio buffers in real-time, and merging MP3s entirely inside the browser's memory. What you see: a beautiful, distraction-free interface that just converts your documents.

---

## How It Works

Microsoft Edge (the web browser) has a built-in "Read Aloud" accessibility feature that sounds incredibly natural. To make this work, Microsoft built a hidden API endpoint (`wss://speech.platform.bing.com`) that connects the browser directly to their massive Azure cloud data centers, where they run state-of-the-art Neural Text-to-Speech (TTS) AI models.

I figured out how to "impersonate" the Microsoft Edge browser to access this API for free—which is exactly what the `edgeTtsService.ts` file is doing.

By routing everything directly from your browser to the Azure servers, AudioBookConvert doesn't require any backend server, API keys, or subscription fees. It's just you, your browser, and Microsoft's enterprise AI hardware.

---

## Who This Is For

People who want to convert long-form text (documents, articles, textbooks, PDFs) into high-fidelity audiobooks seamlessly — without paying per-character data limits or dealing with robotic voices.

---

## Features

### 1. Parallel Cloud Synthesis
Your document is instantly sliced into optimized blocks and distributed across up to 15 concurrent web workers. Why wait hours to convert a book? The parallel pipeline dramatically reduces generation time.

### 2. High-Fidelity User Experience
Vibecoding has a bad reputation. You describe what you want, AI generates code, and you get inconsistent garbage that falls apart at scale. Not here. V2 ships with:
- **Cinematic Reactive UI:** Floating, glassmorphic blobs that react as you switch conversion states.
- **Dedicated Conversion Dashboards:** A focused execution screen that hides unnecessary configurations while generating.
- **Fail-safe Error Screens:** Clear failure guidance preventing silent timeouts.

### 3. Client-Side Assembly
The entire pipeline runs in your browser. Audio streams are captured from the WebSocket, processed using `lamejs`, assembled in-memory as massive binary buffers, and ultimately downloaded directly to your hard drive. Zero backend databases. Your data never touches our servers.

---

## Getting Started

Because everything is configured for the client side, installation takes roughly ten seconds.

```bash
# Clone the repository
git clone https://github.com/yourusername/AudioBookConvert.git

# Move into Directory
cd AudioBookConvert

# Install Dependencies
npm install

# Run the Development Server
npm run dev
```

Navigate to `http://localhost:5173` to start converting!

---

### Advanced Configuration

The UI has safeguards in place to prevent the Microsoft servers from closing the connection during heavy loads, but you can tune your pipeline in step 2:

| Toggle / Option | Best For | Description |
|-----------------|----------|-------------|
| **Chunk Size** | 4,000 - 8,000 | The max length of text sent per payload. High counts require massive RAM. Keep around 5000 chars for optimal stability. |
| **Parallel Workers** | 5 - 12 | The number of simultaneous TTS threads. Highly dependent on your CPU threading and network bandwidth. |
| **Pacing / Pitch** | Tuning | Real-time preview of exactly how the voice acts before converting. |

### Sonic Optimization Pipeline
- **Normalize Audio (WIP)**: Hard limits peaks to create standard podcast-level volume output.
- **Remove Pauses (WIP)**: Aggressively truncates silent blocks over `500ms`.
- **Stream to Disk**: Automatically offloads massive 2GB+ audio buffers directly to local storage to prevent browser memory exhaustion.

---

## Architecture Stack

| File/Layer | What it does |
|------------|--------------|
| `edgeTtsService.ts` | The core engine. Establishes the wss connection to Bing's Speech API. |
| `convertToAudio.ts` | The orchestrator. Text chunking, Web Worker pools, and promise arrays. |
| `mp3Renderer.ts` | The encoder. Uses `lamejs` to combine standard audio buffers into proper MP3 files. |
| `useWorkflowState.ts` | The brain. Global state management across the React interface. |

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Enterprise text-to-speech doesn't have to cost a fortune. Just convert it.**

</div>
