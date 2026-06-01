<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success.svg?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/Version-1.1.0-orange.svg?style=for-the-badge" alt="Version">
  <br><br>
  <h1>🏡 ELLY: Intelligent Home Automation by ElectraWireless ⚡</h1>
  <p><strong>A lightning-fast, local-first IoT dashboard and conversational AI assistant for the ultimate smart home experience.</strong></p>
</div>

<br/>

## 🌟 Overview

Welcome to the future of smart home control. **ELLY** is an advanced environmental and automation layer designed specifically for modern smart homes. Built by **ElectraWireless**, this project completely re-imagines how we interact with our homes. 

Say goodbye to slow, cloud-dependent dashboards. ELLY uses a 100% localized state management architecture and a lightning-fast local AI parser to give you **instantaneous** feedback and control over every appliance, light, and climate system in your house.

---

## ✨ Key Features

### 🤖 Local-First Conversational AI
Why click when you can just talk? ELLY features a beautifully integrated conversational portal that operates **without** relying on slow, rate-limited cloud LLMs. In version 1.1.0, ELLY's cognitive engine received a massive upgrade:
- 💬 **Advanced Semantic Parsing**: Understands dozens of natural language variations, complex aliases (like "climate" vs "ac", "bulb" vs "light"), and conversational small talk.
- 🧠 **Dynamic Fallback Logic**: Instead of generic errors, ELLY actively attempts to guide you with randomized, context-aware suggestions if a command isn't recognized.
- ⚡ **Zero-Latency Execution**: Saying "Turn off all lights" instantly triggers the event bus to shut off devices with zero network latency.
- 🎙️ **Voice Integration**: Ready for voice command input and text-to-speech output.
- 🎭 **Personality & Humor**: Try asking her for a joke! ELLY is designed to feel alive, responsive, and deeply integrated into your smart home.

### 📊 Comprehensive IoT Dashboard
- **Live Energy Analytics**: Monitor your total home power consumption in real-time (in kilowatts).
- **Device Management**: Individually control ACs, smart plugs, lights, TVs, refrigerators, and security sensors.
- **Dynamic Status Indicators**: Instantly see which devices are active, offline, or consuming high energy.

### 🎨 Stunning UI/UX & Responsive Design
- 🌓 **Native Light & Dark Mode**: Fluid transitions between themes, complemented by beautiful, ambient glassmorphic UI elements and animated background bubbles.
- 📱 **Mobile-First App Experience**: Designed to feel like a native iOS/Android application, but scales perfectly to desktop environments.
- 💫 **Micro-Interactions**: Features elegant animations, skeletons, and loaders powered by Framer Motion and TailwindCSS.

### 🏠 Quick Scenes & Automation Modes
One-tap access to powerful environment macros:
- 🌙 **Night Mode**: Dims the lights, lowers the AC temperature, and activates perimeter sensors.
- 🌿 **Eco/Saver Mode**: Optimizes high-draw appliances to reduce your carbon footprint and save electricity.
- 🚶 **Away Mode**: Arms the security system, turns off all unnecessary devices, and locks the doors.
- 🚨 **Emergency**: Instant system shutdown and alert broadcasting.

---

## 🛠️ Technology Stack

ELLY is built on the bleeding edge of modern web technologies:

*   **Framework**: React 19 / Vite SPA
*   **Routing**: TanStack Router (Client-side, fully type-safe)
*   **Styling**: TailwindCSS v4 with [shadcn/ui](https://ui.shadcn.com/) components
*   **Icons**: Lucide React
*   **Build Tooling**: Vite & [Bun](https://bun.sh/)

---

## 🚀 Getting Started

Want to run ELLY locally on your machine? It's incredibly simple. Make sure you have [Bun](https://bun.sh) installed.

### 1. Clone the Repository
```bash
git clone https://github.com/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems.git
cd ElectraWireless-IoT-and-Embedded-Systems
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Start the Development Server
```bash
bun run dev
```

### 4. Build for Production
To deploy this project to platforms like Vercel, Netlify, or your own server:
```bash
bun run build
```
*(Simply deploy the output `dist` folder to any static hosting provider!)*

---

## 🗣️ AI Command Examples

Want to try the AI? Open the ELLY Portal by tapping the **"Talk to ELLY"** button on the top of the dashboard. Here are some things you can say:

*   *"Turn off all lights"* 💡
*   *"Activate Night Mode"* 🌙
*   *"Set bedroom AC to 23 degrees"* ❄️
*   *"What is the current power consumption?"* 🔋
*   *"Is the door open?"* 🚪
*   *"Eco saver on"* 🌿
*   *"Who is home right now?"* 👥

---

## 📝 Architecture Notes

This project was built from the ground up to be **100% local**, specifically architected without any external cloud dependencies to guarantee absolute privacy, security, and maximum performance.

*   **State Management**: React Context merged with persisted `localStorage` for offline-first reliability.
*   **Event Bus**: The AI command parsing engine integrates directly into the global dispatch system for immediate, localized execution without API latency.

<br/>

<div align="center">
  <p><b>Created by Adil Sukumar & Snehal Dixit from Electrawireless</b></p>
</div>
