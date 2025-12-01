# WhatsApp Screen Reader

A web-based application built with Node.js that lets users share their WhatsApp screen and automatically reads incoming messages using a natural female voice. Designed for hands-free communication, accessibility, and productivity.

---

## 🚀 Features

- **Screen Sharing**: Share your WhatsApp screen directly through the web app
- **Real-Time Message Detection**: Automatically identifies and extracts incoming WhatsApp messages
- **Text-to-Speech Output**: Reads messages aloud using a smooth female voice
- **Accessibility-Friendly**: Ideal for hands-free usage, multitasking, or visually-impaired users
- **Lightweight Web UI**: Simple and intuitive interface for easy interaction

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- WebRTC (for screen sharing)
- Gemini API (for message detection)
- Speech Synthesis / TTS API
- JavaScript / HTML / CSS

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- Gemini API Key

---

## 🚀 Run Locally

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/whatsapp-screen-reader.git
   cd whatsapp-screen-reader
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
```
     GEMINI_API_KEY=your_api_key_here
```

4. **Run the application**
```bash
   npm start
```

5. **Open your browser**
   - Navigate to `http://localhost:3000` (or the port specified)

---

## 📖 Usage

1. Open the application in your web browser
2. Click "Share Screen" and select your WhatsApp window
3. Grant necessary permissions for screen sharing and audio
4. Incoming WhatsApp messages will be automatically detected and read aloud

---

## ⚠️ Privacy & Security

- This application processes screen content locally in real-time
- No message data is stored permanently
- Ensure you trust the environment where you're running this application
- Be mindful of sensitive information visible on your screen

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

[Add your license here - e.g., MIT License]

---

## 👤 Author

[Your Name/Username]

---

## ⭐ Show your support

Give a ⭐️ if this project helped you!
