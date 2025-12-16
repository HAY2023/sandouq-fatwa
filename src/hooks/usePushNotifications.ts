import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsSupported(true);
      }
    };
    checkSupport();
  }, []);

  const requestPermission = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not supported on web');
      return false;
    }

    try {
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          return false;
        }
      } else if (permStatus.receive !== 'granted') {
        return false;
      }

      await PushNotifications.register();

      // Listen for registration success
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token:', token.value);
        setToken(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error:', error);
      });

      // Listen for incoming notifications
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received:', notification);
      });

      // Listen for notification action
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        console.log('Push notification action performed:', notification);
      });

      return true;
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  };

  return {
    token,
    isSupported,
    requestPermission,
  };
}
