import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'GeoTransporteAPP',
  webDir: 'www',
  plugins: {
    GoogleMaps: {
      androidApiKey: 'AIzaSyC47HkOHPl4x5jKX2k4WVQQoNwsUMOJ4mc', 
    },
  },
};

export default config;

