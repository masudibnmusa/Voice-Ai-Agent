WhatsApp Screen Reader

A web-based application built with Node.js that lets users share their WhatsApp screen and automatically reads incoming messages using a natural female voice. Designed for hands-free communication, accessibility, and productivity.

🚀 Features

Screen Sharing: Share your WhatsApp screen directly through the web app.

Real-Time Message Detection: Automatically identifies and extracts incoming WhatsApp messages.

Text-to-Speech Output: Reads messages aloud using a smooth female voice.

Accessibility-Friendly: Ideal for hands-free usage, multitasking, or visually-impaired users.

Lightweight Web UI: Simple and intuitive interface for easy interaction.

🛠️ Tech Stack

Node.js

Express.js (if applicable)

WebRTC for screen sharing

Speech Synthesis / TTS API

JavaScript / HTML / CSS

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
