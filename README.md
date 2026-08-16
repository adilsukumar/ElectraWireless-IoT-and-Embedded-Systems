<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:3b82f6,100:8b5cf6&height=250&section=header&text=ELLY%20Smart%20Home&fontSize=70&fontColor=ffffff&animation=twinkling&desc=For%20ElectraWireless%20%7C%20by%20Adil%20Sukumar%20and%20Snehal%20Dixit&descAlignY=75&descSize=20" alt="ELLY Smart Home Header" />
</div>

<div align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" /></a>
  <a href="https://capacitorjs.com/"><img src="https://img.shields.io/badge/Capacitor_8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" /></a>
  <a href="https://www.tensorflow.org/js"><img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow.js" /></a>
</div>

<br />

> **ELLY** is a local-first environmental control dashboard and conversational AI designed to orchestrate smart home ecosystems. It removes cloud dependencies to provide zero-latency execution, guarantees absolute privacy, and ensures continuous functionality during internet outages.

---

## 🌟 Executive Summary

ELLY reimagines the smart home experience by pushing computation to the edge. Built with a mobile-first philosophy using **React 19**, **TailwindCSS v4**, and **Capacitor 8**, the ecosystem boasts an incredibly fluid, glassmorphic UI characterized by dynamic blurs and deep OLED-optimized blacks. 

Beyond aesthetics, ELLY replaces rigid voice commands with a **Natural Language Processing engine (Web-LLM)** and an **AI Vision portal (TensorFlow.js + MobileNet Embeddings)** that operate entirely offline. By leveraging **Dual-Band Discovery (BLE & Local Subnet)**, ELLY finds, connects, and controls hardware instantaneously without ever routing through a manufacturer's cloud.

---

## 🔌 Unprecedented Hardware Support (60+ Native Protocols)

ELLY is engineered to be the ultimate universal remote for the smart home, completely bypassing the fragmentation of vendor-specific apps. We have natively integrated **over 60+ communication protocols and appliance ecosystems** directly into our Edge Event Bus. 

### Supported Ecosystems & Hardware Protocols
<details>
<summary><b>💡 Smart Lighting & LEDs</b> (Click to expand)</summary>

*   **Philips Hue** (Local API via Bridge)
*   **WLED** (Direct UDP/HTTP Control)
*   **Yeelight** (Local LAN Control Protocol)
*   **LIFX** (Local UDP API)
*   **WiZ** (Local UDP)
*   **Govee** (BLE & Local API)
*   **Nanoleaf** (Local Network API)
*   **MagicHome / FluxLED** (Direct TCP)
*   **IKEA TRÅDFRI** (Via Gateway/CoAP)
*   **Sengled** 
</details>

<details>
<summary><b>📺 Entertainment & Smart Displays</b> (Click to expand)</summary>

*   **Samsung Smart TVs** (Tizen WebSocket / UPnP)
*   **LG ThinQ / WebOS TVs** (WebSocket)
*   **Panasonic Viera** (SOAP / HTTP)
*   **Sony Bravia** (REST API)
*   **Roku** (ECP)
*   **Apple TV / HomeKit AV** (AirPlay / HomeKit)
*   **Google Cast / Chromecast**
*   **Logitech Harmony** (Local XMPP/WebSocket)
*   **Xbox** (Local Console REST API)
</details>

<details>
<summary><b>❄️ Climate Control (HVAC, AC, Fans)</b> (Click to expand)</summary>

*   **Daikin** (Local AirCon API)
*   **Mitsubishi** (MELCloud / Local HTTP)
*   **Sensibo** (Local polling API)
*   **Tado** 
*   **Nest Thermostat** 
*   **Ecobee** 
*   **LG SmartThinQ Air Conditioners**
*   **Big Ass Fans** (Local Haiku API)
*   **Dyson** (Local MQTT Protocol)
</details>

<details>
<summary><b>🔌 Relays, Plugs & DIY IoT</b> (Click to expand)</summary>

*   **Tasmota** (Local MQTT / HTTP)
*   **Shelly** (Local CoIoT / HTTP REST)
*   **Sonoff / eWeLink** (Local DIY Mode)
*   **Tuya / SmartLife** (LocalKey TCP Protocol)
*   **TP-Link Kasa / Tapo** (Local UDP/TCP)
*   **Wemo** (Belkin UPnP)
*   **Broadlink** (Local RF/IR UDP)
*   **Meross** (Local MQTT)
*   **ESPHome** (Native API)
</details>

<details>
<summary><b>🏠 Large Appliances & White Goods</b> (Click to expand)</summary>

*   **Samsung SmartThings Appliances** (Refrigerators, Washers)
*   **Bosch Home Connect** 
*   **GE SmartHQ** 
*   **Miele@home** 
*   **iRobot Roomba** (Local MQTT)
*   **Roborock** (Local Miio Protocol)
*   **Ecovacs**
</details>

<details>
<summary><b>🌐 Standards & Gateways</b> (Click to expand)</summary>

*   **Matter** (IPv6 / Thread native integration via border routers)
*   **Thread** 
*   **Homebridge / HomeKit** (HAP Protocol)
*   **Fritz!Box / Smart Home** 
*   **Fronius / Solar Inverters**
*   **Pi-hole** (Local DNS sinkhole controls)
</details>

*Note: Integration levels vary by device, but all utilize ELLY's decentralized event bus to skip external API round-trips for near-instantaneous response times.*

---

## 🎨 Interface & Interaction Design

Our UI/UX architecture is engineered to provide a premium native app experience across all devices.

*   **Visual Language:** Employs state-of-the-art glassmorphism, utilizing dynamic blur effects, floating interactive cards, and squircles for a modern, tactile feel.
*   **Color Palette:** Deep blacks contrasting with luminous pastel purple and blue accents, heavily optimized for battery savings and visual pop on OLED displays.
*   **Motion & Feedback:** Micro-interactions, swipe gestures, and page transitions are driven by `framer-motion` and `tw-animate-css` for buttery-smooth, fluid feedback.
*   **Mobile-First Routing:** Utilizing `TanStack Router` and `TanStack Query`, the interface scales perfectly from native iOS/Android applications (featuring bottom navigation sheets) to robust desktop environments.

---

## 🧠 Conversational AI & Biometric Portal

ELLY removes the need for rigid "wake words" and exact command syntaxes by processing data natively on the device.

*   **In-Browser LLM Inference (`@mlc-ai/web-llm`):** Understands complex natural language variations and semantic aliases (e.g., treating "AC", "cooling", and "climate" as the same operational endpoint) with zero network latency.
*   **Biometric Facial Recognition:** ELLY's AI Vision utilizes MobileNet embeddings (`tfjs`) to perform facial recognition directly on the device. It calculates cosine similarity vectors to specifically recognize custom user profiles (like identifying "Snehal Dixit") without sending images to the cloud.
*   **On-Device Computer Vision:** Utilizing TensorFlow.js and the COCO-SSD model, the system performs real-time object detection and movement tracking on live camera feeds.
*   **Voice Operations:** Features native Text-to-Speech (TTS) and Speech-to-Text (STT) via Capacitor for a seamless hands-free portal.
*   **Dynamic Fallback Logic:** Intelligently suggests randomized, context-aware alternatives when a command falls outside recognized parameters.

---

## ⚡ Core Architecture & Data Flow

Engineered for complete offline reliability and zero-latency execution.

### State & Storage Backbone
*   **Hydration:** Global application state is managed via React 19 Context and continuously synced with `localStorage`.
*   **Resilience:** If external routing drops, the local dashboard and automated triggers retain 100% of their operational logic.

### Decentralized Event Bus
*   **Workflow:** When the Web-LLM parser recognizes an intent, the payload is immediately broadcast to the corresponding device adapter.
*   **Latency Elimination:** By skipping external API round-trips, the system achieves near-instantaneous hardware response times.

### Technology Stack
| Layer | Technologies Utilized |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & UI** | TailwindCSS v4, Radix UI, Lucide React, Recharts |
| **Routing & State** | TanStack Router, TanStack Query, React Context |
| **Edge AI & Vision** | `@mlc-ai/web-llm`, TensorFlow.js, coco-ssd, MobileNet |
| **Native Compilation** | `@capacitor/core` (iOS/Android bindings) |

---

## 🔌 Hardware Connectivity & Protocol Interface

### Dual-Band Discovery Engine
The system bypasses standard browser sandboxing to detect hardware automatically without manual IP configuration.
*   **Bluetooth Low Energy (BLE):** Utilizes native Capacitor plugins to scan for and establish connections with smart peripherals actively broadcasting in pairing mode.
*   **Wi-Fi Subnet Scanning:** Sweeps the local subnet via Port 55000 to identify IP-based smart appliances, hooking directly into native REST/SOAP endpoints.

### Modular Protocol Bridges
Device integration is strictly decoupled from the core event bus for future-proofing.
*   **Architecture:** Protocol bridges (e.g., `samsung.ts`) operate as self-contained modules. Adding support for Matter, Zigbee, or MQTT simply requires dropping a new adapter into the directory without refactoring core logic.
*   **Universal Remotes:** Exposes full D-Pad interactions, input source switching, and precise volume control for Smart Displays (Samsung, Panasonic).
*   **Immersive Controls:** Fluid, touch-optimized circular sliders for HVAC/AC units, multi-stage fan speed controllers, and tactile RGB+ color pickers for smart lights.

---

## 🛡️ Automation, Security & Analytics

*   **Energy Consumption Monitoring:** Integrates a live energy dashboard utilizing `recharts` to visualize real-time power draw and temperature trends across the household.
*   **Local-Only Credential Storage:** Employs secure, encrypted local storage for sensitive TV and API tokens so credentials never leave the physical device.
*   **Always-On Dashboard Mode:** Integrates `@capacitor-community/keep-awake` to prevent the device from sleeping when mounted as a permanent smart home wall-panel.

### Macro Automations
Pre-configured environmental states manage multiple hardware endpoints simultaneously:

| Automation Mode | System Actions Initiated |
| :--- | :--- |
| 🌙 **Night Mode** | Dims internal lighting, lowers HVAC temperature, and activates perimeter security sensors. |
| 🍃 **Eco/Saver Mode** | Identifies and throttles high-draw appliances to optimize energy consumption. |
| 🔒 **Away Mode** | Arms security modules, terminates unnecessary power loads, and engages smart locks. |

---

## 🚀 DevOps & Deployment Lifecycle

### Web Development Environment
Requires Node.js (v18+) or Bun.
1. Clone the repository: `git clone [repository-url]`
2. Install dependencies: `npm install`
3. Initialize the Vite server: `npm run dev` (Hosts on localhost:5173)

### Native Android Deployment (Local Build)
Compiling via Android Studio unlocks hardware-level BLE and Subnet scanning.
1. Generate the web production build: `npm run build`
2. Synchronize the Capacitor configuration: `npx cap sync android`
3. Launch the IDE: `npx cap open android`
4. Compile the APK or execute directly on a physical debugging device.

### Native iOS Deployment (CI/CD Pipeline)
iOS builds are automated via GitHub Actions, eliminating the need for a local macOS environment.
1. Navigate to the repository's **Actions** tab.
2. Execute the **Build iOS IPA (Unsigned)** workflow.
3. Download the generated `Elly-iOS-App` artifact.
4. Sideload the resulting `.ipa` file using standard provisioning tools (e.g., AltStore, Sideloadly).

---

<div align="center">
  <p>Engineered with ❤️ for the future of localized computing.</p>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:8b5cf6,100:3b82f6&height=100&section=footer" alt="Footer" />
</div>
