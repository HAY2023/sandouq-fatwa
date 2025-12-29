import { supabase } from '@/integrations/supabase/client';

interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
}

function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  
  // نوع الجهاز
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    deviceType = 'tablet';
  }
  
  // المتصفح
  let browser = 'unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  // نظام التشغيل
  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  
  // حجم الشاشة
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  
  return { deviceType, browser, os, screenSize };
}

export async function logAdminAccess(isAuthorized: boolean, passwordAttempted: boolean = false) {
  try {
    const deviceInfo = getDeviceInfo();
    
    // جلب معلومات الموقع والـ IP
    let ipData = { ip: 'unknown', country: 'unknown', city: 'unknown' };
    try {
      const ipResponse = await fetch('https://ipapi.co/json/', { 
        signal: AbortSignal.timeout(5000) 
      });
      if (ipResponse.ok) {
        const data = await ipResponse.json();
        ipData = {
          ip: data.ip || 'unknown',
          country: data.country_name || 'unknown',
          city: data.city || 'unknown',
        };
      }
    } catch (e) {
      console.log('Could not fetch IP info');
    }
    
    // تسجيل الدخول
    const { error } = await supabase.rpc('log_admin_access', {
      p_ip_address: ipData.ip,
      p_country: ipData.country,
      p_city: ipData.city,
      p_device_type: deviceInfo.deviceType,
      p_browser: deviceInfo.browser,
      p_os: deviceInfo.os,
      p_screen_size: deviceInfo.screenSize,
      p_is_authorized: isAuthorized,
      p_password_attempted: passwordAttempted,
    });
    
    if (error) {
      console.error('Error logging admin access:', error);
    }
  } catch (error) {
    console.error('Error in logAdminAccess:', error);
  }
}
