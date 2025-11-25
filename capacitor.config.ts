import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0d5544f60b794e0f8c7b519199de4c0f',
  appName: 'Papa Tacos',
  webDir: 'dist',
  server: {
    url: 'https://0d5544f6-0b79-4e0f-8c7b-519199de4c0f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
