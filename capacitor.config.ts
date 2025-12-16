import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.fe1945067cd94de8aafee158e44b1ea7',
  appName: 'seerah-sooq',
  webDir: 'dist',
  server: {
    url: 'https://fe194506-7cd9-4de8-aafe-e158e44b1ea7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
