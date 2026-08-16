import { CapacitorHttp, Capacitor } from '@capacitor/core';
import { CapacitorWebsocket } from '@miaz/capacitor-websocket';

export const SAMSUNG_KEYS = {
  POWER: 'KEY_POWER',
  VOL_UP: 'KEY_VOLUP',
  VOL_DOWN: 'KEY_VOLDOWN',
  CH_UP: 'KEY_CHUP',
  CH_DOWN: 'KEY_CHDOWN',
  UP: 'KEY_UP',
  DOWN: 'KEY_DOWN',
  LEFT: 'KEY_LEFT',
  RIGHT: 'KEY_RIGHT',
  OK: 'KEY_ENTER',
  RETURN: 'KEY_RETURN',
  MUTE: 'KEY_MUTE',
  HOME: 'KEY_HOME',
  SOURCE: 'KEY_SOURCE',
  APPS: 'KEY_CONTENTS',
  RED: 'KEY_RED',
  GREEN: 'KEY_GREEN',
  YELLOW: 'KEY_YELLOW',
  BLUE: 'KEY_BLUE',
  NUM_0: 'KEY_0',
  NUM_1: 'KEY_1',
  NUM_2: 'KEY_2',
  NUM_3: 'KEY_3',
  NUM_4: 'KEY_4',
  NUM_5: 'KEY_5',
  NUM_6: 'KEY_6',
  NUM_7: 'KEY_7',
  NUM_8: 'KEY_8',
  NUM_9: 'KEY_9',
};

async function sendNativePayload(wsName: string, keyCommand: string) {
  const payload = {
    method: 'ms.remote.control',
    params: {
      Cmd: 'Click',
      DataOfCmd: keyCommand,
      Option: 'false',
      TypeOfRemote: 'SendRemoteKey',
    },
  };
  await CapacitorWebsocket.send({ name: wsName, data: JSON.stringify(payload) });
}

function sendPayload(ws: WebSocket, keyCommand: string) {
  const payload = {
    method: 'ms.remote.control',
    params: {
      Cmd: 'Click',
      DataOfCmd: keyCommand,
      Option: 'false',
      TypeOfRemote: 'SendRemoteKey',
    },
  };
  ws.send(JSON.stringify(payload));
}

/**
 * Connects to Samsung TV via WebSocket and sends a command.
 */
export async function sendSamsungCommand(ip: string, keyCommand: string): Promise<boolean> {
  const appName = btoa("EllyApp");
  // Force ignore token to force a new pairing prompt for the demo
  const cachedToken = null; 

  const connectToTV = (wsUrl: string): Promise<boolean> => {
    return new Promise(async (resolve) => {
      let finalUrl = wsUrl;
      if (cachedToken && wsUrl.includes('8002')) {
        finalUrl += `&token=${cachedToken}`;
      }

      if (Capacitor.isNativePlatform()) {
         const wsName = 'samsung_tv_' + Date.now();
         try {
           await CapacitorWebsocket.build({ name: wsName, url: finalUrl });

           const timeout = setTimeout(async () => {
             try { await CapacitorWebsocket.disconnect({ name: wsName }); } catch (e) {}
             resolve(false);
           }, 30000);

           await CapacitorWebsocket.addListener(`${wsName}:connected`, async () => {
             if (cachedToken) {
               await sendNativePayload(wsName, keyCommand);
               setTimeout(async () => {
                 try { await CapacitorWebsocket.disconnect({ name: wsName }); } catch (e) {}
                 clearTimeout(timeout);
                 resolve(true);
               }, 500);
             }
           });

           await CapacitorWebsocket.addListener(`${wsName}:textmessage`, async (event: any) => {
             try {
               const msg = JSON.parse(event.data);
               if (msg.event === 'ms.channel.connect') {
                 if (msg.data && msg.data.token && wsUrl.includes('8002')) {
                   localStorage.setItem(`samsung_token_${ip}`, msg.data.token);
                 }
                 if (!cachedToken) {
                   await sendNativePayload(wsName, keyCommand);
                   setTimeout(async () => {
                     try { await CapacitorWebsocket.disconnect({ name: wsName }); } catch (e) {}
                     clearTimeout(timeout);
                     resolve(true);
                   }, 500);
                 }
               } else if (msg.event === 'ms.channel.unauthorized') {
                 localStorage.removeItem(`samsung_token_${ip}`);
                 try { await CapacitorWebsocket.disconnect({ name: wsName }); } catch (e) {}
                 clearTimeout(timeout);
                 resolve(false);
               }
             } catch (e) {}
           });

           await CapacitorWebsocket.addListener(`${wsName}:error`, async () => {
             try { await CapacitorWebsocket.disconnect({ name: wsName }); } catch (e) {}
             clearTimeout(timeout);
             resolve(false);
           });
           
           await CapacitorWebsocket.addListener(`${wsName}:connecterror`, async () => {
             try { await CapacitorWebsocket.disconnect({ name: wsName }); } catch (e) {}
             clearTimeout(timeout);
             resolve(false);
           });

           await CapacitorWebsocket.addListener(`${wsName}:disconnected`, async () => {
             try { await CapacitorWebsocket.disconnect({ name: wsName }); } catch (e) {}
             clearTimeout(timeout);
             resolve(false);
           });

           await CapacitorWebsocket.connect({ name: wsName });
         } catch (e) {
           resolve(false);
         }
      } else {
         // Browser Fallback
         try {
           const ws = new WebSocket(finalUrl);
           
           const timeout = setTimeout(() => {
             ws.close();
             resolve(false);
           }, 30000);

           ws.onopen = () => {
             if (cachedToken) {
               sendPayload(ws, keyCommand);
               setTimeout(() => {
                 ws.close();
                 clearTimeout(timeout);
                 resolve(true);
               }, 500);
             }
           };

           ws.onmessage = (event) => {
             try {
               const msg = JSON.parse(event.data);
               if (msg.event === 'ms.channel.connect') {
                 if (msg.data && msg.data.token && wsUrl.includes('8002')) {
                   localStorage.setItem(`samsung_token_${ip}`, msg.data.token);
                 }
                 if (!cachedToken) {
                    sendPayload(ws, keyCommand);
                    setTimeout(() => {
                      ws.close();
                      clearTimeout(timeout);
                      resolve(true);
                    }, 500);
                 }
               } else if (msg.event === 'ms.channel.unauthorized') {
                 localStorage.removeItem(`samsung_token_${ip}`);
                 ws.close();
                 clearTimeout(timeout);
                 resolve(false);
               }
             } catch (e) {}
           };

           ws.onerror = (e) => {
             ws.close();
             clearTimeout(timeout);
             resolve(false);
           };
         } catch (error) {
           resolve(false);
         }
      }
    });
  };

  try {
    await fetch(`https://${ip}:8002/api/v2/`);
  } catch (e) {}

  let success = await connectToTV(`wss://${ip}:8002/api/v2/channels/samsung.remote.control?name=${appName}`);
  
  if (!success) {
    success = await connectToTV(`ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${appName}`);
  }

  return success;
}

import { getLocalSubnet } from "./network";

/**
 * Sweeps the local network to find Samsung Smart TVs.
 * Returns the IP address if found, otherwise null.
 */
export async function autoDiscoverSamsungTV(): Promise<string | null> {
  const localSubnet = await getLocalSubnet();
  const subnetsToScan = localSubnet ? [localSubnet] : ['192.168.1', '192.168.0', '192.168.29', '192.168.31', '192.168.50', '10.0.0'];
  const ipsToScan: string[] = [];
  
  for (const subnet of subnetsToScan) {
    for (let i = 2; i <= 254; i++) {
      ipsToScan.push(`${subnet}.${i}`);
    }
  }

  // Reduced to 10 to prevent Capacitor bridge crashes
  const chunkSize = 10;
  for (let i = 0; i < ipsToScan.length; i += chunkSize) {
    const chunk = ipsToScan.slice(i, i + chunkSize);
    
    const promises = chunk.map(ip => new Promise<string | null>(async (resolve) => {
      try {
        // Tizen API endpoint for TV metadata
        const response = await CapacitorHttp.get({
          url: `http://${ip}:8001/api/v2/`,
          connectTimeout: 1500,
          readTimeout: 1500,
        });

        if (response.status === 200 && response.data) {
           const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
           if (data.device && (data.device.modelName || data.device.name)) {
             resolve(ip);
             return;
           }
        }
        resolve(null);
      } catch (error) {
        resolve(null);
      }
    }));

    const results = await Promise.all(promises);
    const foundIp = results.find(ip => ip !== null);
    if (foundIp) {
      return foundIp;
    }
  }

  return null;
}
