import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';

const useNativeAppSetup = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  const [connected, setConnected] = useState(globalThis.navigator?.onLine ?? true);

  useEffect(() => {
    document.documentElement.classList.toggle('native-app', isNative);
    document.documentElement.dataset.appPlatform = platform;

    if (isNative) {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
      if (platform === 'android') StatusBar.setBackgroundColor({ color: '#603B55' }).catch(() => {});
    }

    let removeNetworkListener = () => {};
    Network.getStatus().then((status) => setConnected(status.connected)).catch(() => {});
    Network.addListener('networkStatusChange', (status) => setConnected(status.connected))
      .then((handle) => { removeNetworkListener = () => handle.remove(); })
      .catch(() => {});

    return () => {
      removeNetworkListener();
      document.documentElement.classList.remove('native-app');
    };
  }, [isNative, platform]);

  return { connected, isNative, platform };
};

export default useNativeAppSetup;
