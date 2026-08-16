<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:3b82f6,100:8b5cf6&height=250&section=header&text=ELLY%20Smart%20Home&fontSize=70&fontColor=ffffff&animation=twinkling&desc=For%20ElectraWireless%20%7C%20by%20Adil%20Sukumar%20and%20Snehal%20Dixit&descAlignY=75&descSize=20" alt="ELLY Smart Home Header" />
</div>

<div align="center">
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" /></a>
  <a href="https://capacitorjs.com/"><img src="https://img.shields.io/badge/Capacitor_8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" /></a>
  <a href="https://www.tensorflow.org/js"><img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow.js" /></a>
  <a href="https://mlc.ai/web-llm/"><img src="https://img.shields.io/badge/Web_LLM-4B0082?style=for-the-badge&logo=web&logoColor=white" alt="Web-LLM" /></a>
</div>

<br />

> **ELLY** is the ultimate local-first, zero-latency environmental control dashboard and conversational AI ecosystem. Designed to orchestrate highly complex smart home infrastructures without relying on cloud servers, ELLY guarantees absolute privacy, unparalleled speed, and continuous functionality during internet outages.

---

## 🌟 Executive Summary

ELLY reimagines the smart home experience by pushing computation entirely to the edge. Built with a mobile-first philosophy using **React 19**, **TailwindCSS v4**, and **Capacitor 8**, the ecosystem boasts an incredibly fluid, glassmorphic UI characterized by dynamic blurs, swipe gestures, and deep OLED-optimized blacks. 

Beyond aesthetics, ELLY replaces rigid voice commands and fragmented apps with a **Natural Language Processing engine (Web-LLM)** and an **AI Vision portal (TensorFlow.js + MobileNet Embeddings)** that operate entirely offline. By leveraging **Dual-Band Discovery (BLE & Local Subnet)**, ELLY finds, connects, and controls over 60+ hardware protocols instantaneously without ever routing through a manufacturer's cloud server.

---

## 🚀 Core Features & Modules

### 🤖 Elly Portal: The Conversational AI
At the heart of the ecosystem is the **EllyPortal**—a conversational AI that breaks the mold of traditional smart assistants.
*   **Edge-Native LLM:** Powered by `@mlc-ai/web-llm`, Elly processes intents natively in the browser/app. She understands contextual aliases, spatial awareness, and chained commands (e.g., *"Dim the lights in the bedroom and turn the AC to 22"*).
*   **Native Voice Engine:** Utilizes Capacitor's native STT (Speech-to-Text) and TTS (Text-to-Speech) for a highly responsive, hands-free conversational interface (`VoiceBar.tsx`).
*   **Dynamic Fallbacks:** If a device is unreachable or a command is ambiguous, Elly provides context-aware conversational alternatives rather than a generic error.

### 👁️ AI Vision & Biometrics
*   **Appliance Scanning:** In the `AddApplianceDialog`, users can simply point their device's camera at an appliance. Using TensorFlow.js and COCO-SSD, ELLY automatically detects the object (e.g., Fan, TV) and initiates pairing mode.
*   **Biometric Facial Recognition:** The `MembersManager` module utilizes MobileNet embeddings to map user facial features. By computing cosine similarity vectors, ELLY can recognize authorized household members locally to restrict access to secure gateways or locks, entirely on-device.
*   **Live Camera Matrix (`camera.tsx`):** Aggregates local IP/RTSP camera feeds into a zero-latency monitoring grid.

### 🏠 Universal Remotes & Dashboards
ELLY provides hyper-specific, beautifully designed remote interfaces for diverse hardware:
*   **TV & Entertainment (`tv-remote.tsx`, `audio-remote.tsx`):** Full D-pad controls, input selection, and volume rockers. Connects directly to Samsung Tizen (via WebSockets), LG WebOS, and Panasonic Viera (via local SOAP).
*   **Climate Control:** Interactive circular sliders and dials for Air Conditioners and HVAC systems.
*   **Smart Refrigeration (`fridge-remote.tsx`):** Tracks internal temperatures and integrates with smart fridge diagnostics.
*   **Gaming Consoles (`console-remote.tsx`):** Xbox and PlayStation local REST API integrations for waking devices and switching inputs.
*   **Spatial Floorplan (`map.tsx`):** An interactive 2D floorplan where users can drag and drop devices into specific rooms, visualizing their smart home layout intuitively.

### ⚡ Analytics & Energy Management
*   **Live Telemetry (`EnergyChart.tsx`):** Utilizes `recharts` to render real-time, interactive graphs detailing live household power draw (Watts), temperature trends, and air quality metrics over time.
*   **Macro Automations (`automations.tsx`):** Create cross-ecosystem routines. E.g., *Night Mode* dims lights, adjusts the HVAC, and arms perimeter sensors. *Eco Mode* actively throttles high-draw appliances based on real-time energy telemetry.

---

## 🔌 Unprecedented Hardware Support (60+ Native Protocols)

ELLY is engineered to be the ultimate universal remote for the smart home. We have natively integrated **over 60+ communication protocols and appliance ecosystems** directly into our Edge Event Bus.

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

---

## 🎨 Interface & Interaction Design

Our UI/UX architecture is engineered to provide a premium native app experience across all devices.

*   **Visual Language:** Employs state-of-the-art glassmorphism, utilizing dynamic blur effects, floating interactive cards, and squircles for a modern, tactile feel.
*   **Color Palette:** Deep blacks contrasting with luminous pastel purple and blue accents, heavily optimized for battery savings and visual pop on OLED displays.
*   **Motion & Feedback:** Micro-interactions, swipe gestures, and page transitions are driven by `framer-motion` and `tw-animate-css` for buttery-smooth, fluid feedback.
*   **Mobile-First Routing:** Utilizing `TanStack Router` and `TanStack Query`, the interface scales perfectly from native iOS/Android applications (featuring bottom navigation sheets) to robust desktop environments.

---

## ⚡ Core Architecture & Data Flow

Engineered for complete offline reliability and zero-latency execution.

### Dual-Band Discovery Engine
The system bypasses standard browser sandboxing to detect hardware automatically without manual IP configuration.
*   **Bluetooth Low Energy (BLE):** Utilizes native Web Bluetooth and Capacitor plugins to scan for and establish connections with smart peripherals actively broadcasting in pairing mode.
*   **Wi-Fi Subnet Scanning:** Sweeps the local subnet via Port 55000 to identify IP-based smart appliances, hooking directly into native REST/SOAP endpoints.

### State & Storage Backbone
*   **Hydration:** Global application state is managed via React 19 Context (`store.tsx`) and continuously synced with `localStorage`.
*   **Resilience:** If external routing drops, the local dashboard and automated triggers retain 100% of their operational logic.

### Decentralized Event Bus
*   **Workflow:** When the Web-LLM parser recognizes an intent or a UI toggle is switched, the payload is immediately broadcast to the corresponding device adapter.
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
