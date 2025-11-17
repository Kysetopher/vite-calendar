import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'LiaiZen',
  webDir: 'dist/public',
  server: {
    url: 'https://chat.liaizen.com',
    cleartext: true
  }
};

export default config;
