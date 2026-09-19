import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaalikolom.medicinedatabase',
  appName: 'Medicine Database',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
