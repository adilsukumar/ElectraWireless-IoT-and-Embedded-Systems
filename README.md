<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=200&section=header&text=ELLY%20Smart%20Home&fontSize=50&fontAlignY=35&desc=By%20ElectraWireless&descAlignY=55&descSize=20&animation=twinkling" width="100%" alt="Header" />
</div>

<div align="center">
  <a href="https://github.com/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-success.svg?style=for-the-badge&logo=open-source-initiative&logoColor=white" alt="License" /></a>
  <img src="https://img.shields.io/badge/Version-1.2.0-orange.svg?style=for-the-badge&logo=semantic-release&logoColor=white" alt="Version">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen.svg?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Status">
</div>

<br/>

<div align="center">
  <h1 align="center">🏡 ELLY: Intelligent Home Automation</h1>
  <p align="center">
    <strong>A lightning-fast, local-first IoT dashboard and conversational AI assistant for the ultimate smart home experience.</strong>
  </p>
</div>

---

<details open>
  <summary><h2>📑 Table of Contents</h2></summary>

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
  - [📡 Unified Native Device Discovery](#-unified-native-device-discovery)
  - [🤖 Local-First Conversational AI](#-local-first-conversational-ai)
  - [🎛️ Universal Remotes & Control](#️-universal-remotes--control)
  - [🔒 Security & Vision Integration](#-security--vision-integration)
  - [⚡ Energy & Automation Hub](#-energy--automation-hub)
- [🎨 Stunning UI/UX & Responsive Design](#-stunning-uiux--responsive-design)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Folder Structure](#-folder-structure)
- [📱 Installation & Deployment](#-installation--deployment)
  - [Run on the Web (Development)](#run-on-the-web-development)
  - [Build for Android (Native)](#build-for-android-native)
  - [Build for iOS (Native via GitHub Actions)](#build-for-ios-native-via-github-actions)
- [📝 Architecture Notes](#-architecture-notes)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👏 Credits](#-credits)
</details>

---

## 🌟 Overview

Welcome to the future of smart home control. **ELLY** is an advanced environmental and automation layer designed specifically for modern smart homes. Built by **ElectraWireless**, this project completely re-imagines how we interact with our living spaces by bridging cutting-edge web technologies with localized hardware protocols.

Say goodbye to slow, cloud-dependent dashboards that fail when your internet goes down. ELLY uses a **100% localized state management architecture** and a **lightning-fast local AI parser** to give you *instantaneous* feedback and control over every appliance, light, and climate system in your house.

<div align="center">
  <img src="https://raw.githubusercontent.com/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems/main/assets/readme-demo.gif" alt="ELLY Demo" width="800" style="border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
  <p><em>(Placeholder for Demo GIF/Video)</em></p>
</div>

---

## ✨ Key Features

### 📡 Unified Native Device Discovery
ELLY features a custom-built, dual-band discovery engine designed to seamlessly detect real hardware on your network with **Zero Setup**:

<table align="center">
  <tr>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bluetooth/bluetooth-original.svg" width="50" alt="Bluetooth" />
      <br />
      <b>Native Bluetooth Low Energy (BLE)</b>
      <p>Bypasses browser sandboxes to scan for and connect to active smart home peripherals (like smart plugs and bulbs) in pairing mode via Capacitor plugins.</p>
    </td>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/network/network-original.svg" width="50" alt="Network" />
      <br />
      <b>Local Wi-Fi Subnet Scanning</b>
      <p>Automatically sweeps the local Wi-Fi subnet (Port 55000) to discover Panasonic Viera, Samsung TVs, and IP-based smart appliances, instantly hooking into their native SOAP/REST interfaces.</p>
    </td>
  </tr>
</table>

### 🤖 Local-First Conversational AI
Why click when you can just talk? ELLY features a beautifully integrated conversational portal that operates **without** relying on slow, rate-limited cloud LLMs, utilizing Web-LLM and local parsing.

*   💬 **Advanced Semantic Parsing**: Understands dozens of natural language variations, complex aliases (like "climate" vs "ac", "bulb" vs "light"), and conversational small talk.
*   🧠 **Dynamic Fallback Logic**: Instead of generic errors, ELLY actively attempts to guide you with randomized, context-aware suggestions if a command isn't recognized.
*   🎙️ **Voice Integration**: Built-in speech-to-text (STT) and text-to-speech (TTS) utilizing native capacitor plugins for a true hands-free Jarvis-like experience.
*   ⚡ **Zero-Latency Execution**: Saying "Turn off all lights" instantly triggers the event bus to shut off devices with zero network latency.

### 🎛️ Universal Remotes & Control
ELLY doesn't just turn things on and off; it provides deep, granular control interfaces for your devices.

*   📺 **Smart TV Remote**: Full D-Pad, volume control, input switching, and app launching directly integrated with Panasonic and Samsung protocols.
*   🎵 **Audio Control**: Multi-room audio syncing, equalizer presets, and volume management.
*   🎮 **Console Management**: Monitor state and manage network connectivity for gaming consoles.
*   ❄️ **Smart Appliances**: Dedicated remote interfaces for AC units (Climate control) and Smart Fridges (Temperature & Inventory monitoring).

### 🔒 Security & Vision Integration
*   📹 **Live Camera Feeds**: Integrates with local IP cameras.
*   👁️ **AI Vision**: Employs `@tensorflow/tfjs` and `coco-ssd` to perform on-device object detection and movement tracking without sending video feeds to external servers.

### ⚡ Energy & Automation Hub
*   📊 **Energy Dashboard**: Real-time charts via `recharts` to monitor household power consumption and optimize usage.
*   🏠 **Room Mapping**: Assign devices to specific rooms with interactive floorplan/map views.
*   ⚙️ **Quick Automations**:
    *   🌙 **Night Mode**: Dims the lights, lowers the AC temperature, and activates perimeter sensors.
    *   🌿 **Eco/Saver Mode**: Optimizes high-draw appliances to reduce your carbon footprint and save electricity.
    *   🚶 **Away Mode**: Arms the security system, turns off all unnecessary devices, and locks the doors.

---

## 🎨 Stunning UI/UX & Responsive Design

<div align="center">
  <img src="https://img.shields.io/badge/Design-Glassmorphism-rgba(255,255,255,0.1)?style=for-the-badge&logo=figma&logoColor=white" alt="Design" />
  <img src="https://img.shields.io/badge/Theme-OLED_Dark-black?style=for-the-badge&logo=moon&logoColor=white" alt="Theme" />
  <img src="https://img.shields.io/badge/Animations-Framer_Motion-e91e63?style=for-the-badge&logo=framer&logoColor=white" alt="Animations" />
</div>
<br />

*   💎 **Premium Glassmorphism**: The entire application is built using advanced glassmorphic design principles with dynamic blur effects, sleek squircles, and floating cards.
*   🌓 **Vibrant Color System**: Beautiful deep blacks with soft, luminous pastel purple/blue accents tailored for OLED displays and modern sensibilities.
*   ✨ **Fluid Animations**: Utilizing `framer-motion` and `tw-animate-css` for buttery-smooth page transitions, micro-interactions, and satisfying visual feedback.
*   📱 **Mobile-First App Experience**: Designed to feel like a native iOS/Android application with bottom navigation sheets and swipe gestures, but scales perfectly to robust desktop environments.

---

## 🛠️ Technology Stack

ELLY is built on the bleeding edge of modern web and mobile technologies, ensuring high performance and developer ergonomics.

### Frontend Core
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="20" /> **React 19**: The latest concurrent rendering features.
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="20" /> **TypeScript**: End-to-end type safety.
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="20" /> **TailwindCSS v4**: Next-gen utility-first styling with custom Glassmorphism tokens.
*   <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="20" /> **Vite**: Ultra-fast HMR and optimized builds.

### Routing & State
*   <img src="https://seeklogo.com/images/T/tanstack-logo-8A18B99DD7-seeklogo.com.png" width="20" /> **TanStack Router**: Fully type-safe client-side routing.
*   <img src="https://seeklogo.com/images/R/react-query-logo-1340EA4CE9-seeklogo.com.png" width="20" /> **TanStack Query**: Powerful asynchronous state management.
*   🗃️ **React Context + LocalStorage**: Robust offline-first global state.

### AI & Machine Learning
*   🧠 **@mlc-ai/web-llm**: In-browser Large Language Model inference.
*   👁️ **TensorFlow.js (@tensorflow/tfjs)**: Local computer vision and classification.

### UI Components & Icons
*   🎨 **Radix UI**: Unstyled, accessible component primitives.
*   🖋️ **Lucide React**: Beautiful, consistent icon set.
*   📈 **Recharts**: Composable charting library.

### Mobile & Native (Capacitor)
*   📱 **@capacitor/core** (iOS/Android)
*   🔌 **Capacitor Plugins**: Speech Recognition, Text-to-Speech, Keep Awake.
*   🔵 **Cordova Plugins**: Bluetooth Serial, Background Mode.

---

## 📁 Folder Structure

```text
ElectraWireless-IoT-and-Embedded-Systems/
├── android/                 # Native Android project (Capacitor)
├── ios/                     # Native iOS project (Capacitor)
├── public/                  # Static assets (fonts, icons, models)
├── src/
│   ├── assets/              # App images and vector graphics
│   ├── components/          # Reusable React components
│   │   ├── elly/            # ELLY AI Assistant specific components
│   │   ├── home/            # Dashboard and dashboard widgets
│   │   └── ui/              # Radix UI primitive wrappers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, hardware API wrappers (samsung.ts, etc.)
│   ├── routes/              # TanStack Router page components (remotes, settings, map)
│   ├── main.tsx             # Application entry point
│   ├── router.tsx           # Router configuration
│   └── styles.css           # Global Tailwind and custom CSS
├── capacitor.config.ts      # Capacitor builder configuration
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite build configuration
└── tailwind.config.ts       # Tailwind theme configuration
```

---

## 📱 Installation & Deployment

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) or [Bun](https://bun.sh) installed. For mobile builds, you will need **Android Studio** and/or **Xcode**.

### Run on the Web (Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems.git
   cd ElectraWireless-IoT-and-Embedded-Systems
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   *The app will be available at `http://localhost:5173`.*

### Build for Android (Native)

To unlock the true power of ELLY (including Native Bluetooth and Wi-Fi Scanning), deploy it as a native Android APK:

1. **Build the web project:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```
   *From Android Studio, you can build the APK or run it directly on an attached physical device.*

### Build for iOS (Native via GitHub Actions)

Don't have a Mac? No problem! This repository is configured with a **Cloud CI/CD Pipeline**.

1. Navigate to the **Actions** tab on this GitHub repository.
2. Select the **Build iOS IPA (Unsigned)** workflow.
3. Click **Run workflow**.
4. Once completed, download the `Elly-iOS-App` artifact (which contains the `.ipa` file).
5. Sideload the app onto your iPhone using **AltStore** or **Sideloadly** from your Windows PC!

---

## 📝 Architecture Notes

This project was built from the ground up to be **100% local**, specifically architected without any external cloud dependencies to guarantee absolute privacy, security, and maximum performance.

*   **Offline-First Reliability**: The entire React Context state is hydrated from and synced to `localStorage`. If your router loses internet connection, your local network dashboard and automations remain 100% functional.
*   **Decentralized Event Bus**: The AI command parsing engine integrates directly into the global dispatch system. When a voice command is recognized, the payload is immediately dispatched to the corresponding device adapter without any API latency.
*   **Modular Hardware Adapters**: Devices in the `src/lib/` folder (like `samsung.ts`) act as self-contained protocol bridges, making it trivial to add support for new smart home ecosystems (Zigbee, Matter, MQTT) in the future.

---

## 🤝 Contributing

We welcome contributions from the community to make ELLY even better!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing formatting (we use `Prettier` and `ESLint`) and that all new device integrations provide a fallback mock for development environments.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <img src="https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=for-the-badge" alt="Open Source Love" />
</div>

---

## 👏 Credits

<div align="center">
  <p><b>Crafted with passion by</b></p>
  <h3>Adil Sukumar & Snehal Dixit</h3>
  <p><b>ElectraWireless Research & Development</b></p>
  <br/>
  <a href="https://github.com/adilsukumar"><img src="https://img.shields.io/badge/GitHub-Adil%20Sukumar-black?style=for-the-badge&logo=github" alt="Adil Sukumar" /></a>
  <a href="https://github.com/snehal-dixit"><img src="https://img.shields.io/badge/GitHub-Snehal%20Dixit-black?style=for-the-badge&logo=github" alt="Snehal Dixit" /></a>
</div>

<br/>

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=100&section=footer" width="100%" alt="Footer" />
</div>
