<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=200&section=header&text=ELLY%20Smart%20Home&fontSize=50&fontAlignY=35&desc=For%20ElectraWireless,%20by%20Adil%20Sukumar%20%26%20Snehal%20Dixit&descAlignY=55&descSize=20&animation=twinkling" width="100%" alt="Header" />
</div>

<div align="center">
  <a href="https://github.com/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems/issues"><img src="https://img.shields.io/github/issues/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems?style=for-the-badge&color=ff4040&logo=github&logoColor=white" alt="Issues" /></a>
  <a href="https://github.com/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems/pulls"><img src="https://img.shields.io/github/issues-pr/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems?style=for-the-badge&color=8a2be2&logo=github&logoColor=white" alt="Pull Requests" /></a>
  <br />
  <img src="https://img.shields.io/badge/Version-1.2.0-orange.svg?style=for-the-badge&logo=semantic-release&logoColor=white" alt="Version">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen.svg?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Status">
</div>

<br/>

<div align="center">
  <h1 align="center">🏡 ELLY: Intelligent Home Automation</h1>
</div>

---

## 📝 Executive Summary

**ELLY** is a monolithic, fully localized smart home automation platform built by **ElectraWireless**. Designed to completely eliminate the latency, privacy concerns, and downtime associated with cloud-dependent IoT systems, ELLY functions as a standalone brain for your environment. 

It combines **cutting-edge web architectures (React 19, Vite, TanStack Router)** with **in-browser Machine Learning (Web-LLM, TensorFlow.js)** to deliver a zero-latency conversational AI and computer vision security system. Packaged natively for iOS and Android via Capacitor, it discovers devices organically across Wi-Fi and Bluetooth, uniting Panasonic TVs, Samsung appliances, and BLE hardware under one gorgeous, glassmorphic UI.

---

<details open>
  <summary><h2>📑 Detailed Table of Contents</h2></summary>

- [📝 Executive Summary](#-executive-summary)
- [✨ Extensive Feature Breakdown](#-extensive-feature-breakdown)
  - [Hardware & Device Discovery](#hardware--device-discovery)
  - [Conversational AI Portal](#conversational-ai-portal)
  - [Security & Local Vision](#security--local-vision)
  - [Energy & Environment Macros](#energy--environment-macros)
- [🛠️ Deep Dive: Technology Stack](#️-deep-dive-technology-stack)
- [🧠 Under the Hood: How We Built It](#-under-the-hood-how-we-built-it)
  - [1. Local In-Browser LLM Engine](#1-local-in-browser-llm-engine)
  - [2. On-Device TensorFlow Vision & Face Recognition](#2-on-device-tensorflow-vision--face-recognition)
  - [3. Zero-Setup Discovery Protocol (Wi-Fi & BLE)](#3-zero-setup-discovery-protocol-wi-fi--ble)
  - [4. The Decentralized Event Bus](#4-the-decentralized-event-bus)
- [🎨 Aesthetics & UI Engineering](#-aesthetics--ui-engineering)
- [📁 Project Architecture (Tree)](#-project-architecture-tree)
- [📱 Installation & Deployment](#-installation--deployment)
  - [Web / Local Server](#web--local-server)
  - [Android Native Deployment](#android-native-deployment)
  - [iOS Cloud Build Pipeline](#ios-cloud-build-pipeline)
- [🤝 Contributing](#-contributing)
- [👏 Credits](#-credits)
</details>

---

## ✨ Extensive Feature Breakdown

### Hardware & Device Discovery
*   **Dual-Band Scanner:** The system automatically sweeps the local network (Port 55000 for Panasonic SOAP, REST for Samsung) and leverages Native Bluetooth Low Energy APIs to find devices.
*   **Universal Remotes:** Deep, granular React control panels built specifically for:
    *   **Smart TVs:** Full D-Pad navigation, app launching, input switching, and volume control.
    *   **Climate Control (AC):** Thermostat dialing and swing modes.
    *   **Refrigerators:** Temperature monitoring and inventory tagging.
    *   **Audio/Consoles:** Volume syncing and power state management.

### Conversational AI Portal
*   **Natural Language Processing:** Say things like "Set the bedroom AC to 23 degrees" or "Turn off everything." The semantic parser breaks this down without needing rigid, robotic phrasing.
*   **Jarvis-Mode Voice Integration:** Uses Capacitor's native Speech-to-Text (`@capacitor-community/speech-recognition`) and Text-to-Speech engines for hands-free interactions. 

### Security & Local Vision
*   **Real-time Object Detection:** Identifies people, pets, and movement directly through local IP cameras using COCO-SSD.
*   **Custom Face Registration:** Allows the homeowner to register faces via the device's camera, mapping embeddings locally so the system recognizes authorized users versus intruders.

### Energy & Environment Macros
*   **Live Metrics:** Recharts integration displays total Wattage load on the house dynamically.
*   **One-Tap Automations:** Night Mode, Eco/Saver Mode, and Away Mode dynamically adjust dozens of variables across the state tree in milliseconds.

---

## 🛠️ Deep Dive: Technology Stack

We refused to compromise on performance. ELLY utilizes the absolute latest web paradigms to achieve native-like speeds:

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19, Vite, TypeScript | Concurrent rendering, type safety, and blazing fast HMR. |
| **Routing** | `@tanstack/react-router` | Client-side, 100% type-safe file-based routing mechanism. |
| **State Management** | `@tanstack/react-query`, React Context | Handles asynchronous network requests and global hydration via LocalStorage. |
| **Styling Engine** | TailwindCSS v4, Radix UI | Utility-first styling with unstyled, highly accessible primitive components. |
| **Animations** | `framer-motion`, `tw-animate-css` | Complex physics-based micro-interactions and transitions. |
| **Machine Learning** | `@mlc-ai/web-llm`, `@tensorflow/tfjs` | Heavy lifting for local semantic parsing and computer vision. |
| **Mobile Compilation** | Capacitor 8.x, Cordova Plugins | Native shell bridging web tech to iOS/Android hardware APIs (Bluetooth, Mic). |

---

## 🧠 Under the Hood: How We Built It

This project is a masterclass in pushing the modern browser (and WebViews) to their absolute limits. Here is exactly how we engineered the core pillars of ELLY:

### 1. Local In-Browser LLM Engine
To completely sever ties with the cloud (like OpenAI or Claude APIs), we implemented `@mlc-ai/web-llm`. 
*   **How it works:** When ELLY boots, it utilizes WebGPU (or falls back to WASM) to load a quantized Large Language Model directly into the user's local memory footprint. 
*   **Execution:** When a user dictates a command via the microphone, the text is passed to this local LLM. We structured a strict prompt architecture that forces the LLM to output precise JSON corresponding to our device states. This gives ELLY the ability to handle conversational small talk ("How are you?") while flawlessly interpreting command intent ("Turn the lights blue") *entirely offline*.

### 2. On-Device TensorFlow Vision & Face Recognition
In the `/camera` route, we didn't just want to embed an IP stream. We wanted the home to *see*.
*   **How it works:** We pull the MediaStream and feed the HTML `<video>` frames directly into `@tensorflow/tfjs`. We run the `coco-ssd` model concurrently to draw bounding boxes around identified objects (cars, pets, humans).
*   **Face Embeddings:** We implemented a custom registration hook that uses MobileNet to generate multi-dimensional vector embeddings of faces. When active, it calculates cosine similarity against registered faces to trigger specific automations (e.g., unlocking a door when the owner walks up, or alerting if an unknown person is at the door).

### 3. Zero-Setup Discovery Protocol (Wi-Fi & BLE)
We eliminated the need for QR codes and complex pairing flows.
*   **Wi-Fi Sweep (`src/lib/panasonic.ts` & `samsung.ts`):** ELLY dynamically iterates through local subnet IPs (e.g., `192.168.1.X`), pinging standardized ports. For Panasonic TVs, it targets port `55000` and instantly negotiates an XML-SOAP handshake, generating an API token.
*   **Bluetooth Low Energy:** Using the `cordova-plugin-bluetooth-serial`, we bypass sandbox restrictions to actively scan for unpaired smart-plugs or bulbs broadcasting in pairing mode, intercepting their GATT characteristics.

### 4. The Decentralized Event Bus
Typical React apps use top-down prop drilling or massive Redux stores. We designed a localized Event Bus inside our Context.
*   **How it works:** Every interactive component (a light switch, a TV D-Pad) dispatches an action. The reducer doesn't just update the UI state; it fires asynchronous side-effects to the hardware wrapper simultaneously. This ensures the UI is optimistically updated at 120hz, while the network request (which might take 50ms) trails behind, resulting in a system that feels utterly instantaneous.

---

## 🎨 Aesthetics & UI Engineering

We believe a smart home dashboard shouldn't look like an Excel spreadsheet. It should look like the future.

*   **Deep Glassmorphism:** We wrote custom CSS filters combining `backdrop-blur`, saturated `rgba` overlays, and subtle `box-shadow` techniques to create floating, frosted glass panels.
*   **OLED Tailored:** The color palette relies heavily on pure `#000000` blacks interspersed with electric purple (`#8b5cf6`) and neon accents. On physical mobile OLED screens, this saves battery and creates infinite contrast.
*   **Dynamic SVG Integration:** From custom SVGs mapped for specific devices (routers, game consoles) to fluid `framer-motion` layout transitions that guide the user's eye organically as they navigate rooms.

---

## 📁 Project Architecture (Tree)

```text
ElectraWireless-IoT-and-Embedded-Systems/
├── android/                 # Native Capacitor wrapper (Java/Gradle)
├── ios/                     # Native Capacitor wrapper (Swift/Podfile)
├── src/
│   ├── assets/              # Static vector graphics & animations
│   ├── components/
│   │   ├── elly/            # The conversational AI portal & Web-LLM hooks
│   │   ├── home/            # Dashboard tiles, Modals, Energy Charts
│   │   └── ui/              # Radix UI implementations (shadcn inspired)
│   ├── hooks/               # Custom React lifecycle hooks
│   ├── lib/                 # Core Brain:
│   │   ├── home/            # Global state store, Reducers, AI parser logic
│   │   ├── panasonic.ts     # Panasonic Viera SOAP API wrapper
│   │   ├── samsung.ts       # Samsung Smart API wrapper
│   │   └── network.ts       # Local subnet utilities
│   ├── routes/              # TanStack File-Based Routes (Pages)
│   │   ├── camera.tsx       # TensorFlow vision engine
│   │   ├── index.tsx        # Main dashboard
│   │   ├── map.tsx          # Interactive floorplan
│   │   └── tv-remote.tsx    # Dedicated remote GUI
│   ├── main.tsx             # DOM Entrypoint
│   └── styles.css           # Global Tailwind tokens & Glassmorphism classes
├── capacitor.config.ts      # Native build bridging logic
└── package.json             # NPM architecture
```

---

## 📱 Installation & Deployment

### Web / Local Server
*Requirements: Node 18+ or Bun*

```bash
git clone https://github.com/adilsukumar/ElectraWireless-IoT-and-Embedded-Systems.git
cd ElectraWireless-IoT-and-Embedded-Systems
npm install
npm run dev
```

### Android Native Deployment
To access the Native Bluetooth & Background Keep-Awake features:

```bash
npm run build
npx cap sync android
npx cap open android
```
*(Requires Android Studio. From there, click the 'Play' button to compile the APK to an attached phone).*

### iOS Cloud Build Pipeline
We implemented a GitHub Actions workflow to build the `.ipa` without needing a local macOS machine.

1. Go to the **Actions** tab on this repo.
2. Select the **Build iOS IPA (Unsigned)** workflow.
3. Click **Run workflow**.
4. Download the `Elly-iOS-App` artifact upon completion.
5. Sideload via **AltStore** or **Sideloadly**!

---

## 🤝 Contributing

This project is actively maintained by ElectraWireless R&D. If you want to integrate a new smart home protocol (like Zigbee over serial, or MQTT bridging):

1. Fork the repo.
2. Add your hardware interface inside `src/lib/`.
3. Add a mock fallback so developers without the hardware can still test the UI!
4. Submit a Pull Request.

---

## 👏 Credits

<div align="center">
  <p><b>Conceptualized, Designed, and Engineered by</b></p>
  <h2>Adil Sukumar & Snehal Dixit</h2>
  <p><b>ElectraWireless Research & Development</b></p>
  <br/>
  <a href="https://github.com/adilsukumar"><img src="https://img.shields.io/badge/GitHub-Adil%20Sukumar-black?style=for-the-badge&logo=github" alt="Adil Sukumar" /></a>
  <a href="https://github.com/snehal-dixit"><img src="https://img.shields.io/badge/GitHub-Snehal%20Dixit-black?style=for-the-badge&logo=github" alt="Snehal Dixit" /></a>
</div>

<br/>
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=100&section=footer" width="100%" alt="Footer" />
</div>
