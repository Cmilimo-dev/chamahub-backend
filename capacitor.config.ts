
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jcnetglobal.chamahub',
  appName: 'ChamaHub',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    allowNavigation: [
      'localhost',
      '127.0.0.1',
      '10.0.2.2',
      '192.168.*',
      'http://10.0.2.2:4000',
      'http://localhost:4000'
    ]
  },
  android: {
    buildOptions: {
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      minSdkVersion: 23,
      javaVersion: '17'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#16a34a',
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#16a34a'
    }
  }
};

export default config;
