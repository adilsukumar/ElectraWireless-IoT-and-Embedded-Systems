import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elly.app',
  appName: 'ElectraWireless',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;
