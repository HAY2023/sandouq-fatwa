import { supabase } from '@/integrations/supabase/client';

interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
  userAgent: string;
  timezone: string;
  language: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  networkType: string;
  referrer: string;
  connectionType: string;
  touchSupport: boolean;
  colorDepth: number;
  pixelRatio: number;
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
  
  // نوع الاتصال
  const connection = (navigator as any).connection;
  const networkType = connection?.effectiveType || 'unknown';
  const connectionType = connection?.type || 'unknown';
  
  // دعم اللمس
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return {
    deviceType,
    browser,
    os,
    screenSize,
    userAgent: ua,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || null,
    networkType,
    referrer: document.referrer || 'direct',
    connectionType,
    touchSupport,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  };
}

// إنشاء بصمة بسيطة للمتصفح
function generateFingerprint(): string {
  const deviceInfo = getDeviceInfo();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasFingerprint = '';
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    canvasFingerprint = canvas.toDataURL().slice(-50);
  }
  
  const fingerPrintData = [
    deviceInfo.userAgent,
    deviceInfo.timezone,
    deviceInfo.language,
    deviceInfo.screenSize,
    deviceInfo.colorDepth.toString(),
    deviceInfo.pixelRatio.toString(),
    deviceInfo.hardwareConcurrency.toString(),
    canvasFingerprint,
    new Date().getTimezoneOffset().toString(),
  ].join('|');
  
  // تشفير بسيط للبصمة
  let hash = 0;
  for (let i = 0; i < fingerPrintData.length; i++) {
    const char = fingerPrintData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}

export async function logAdminAccess(isAuthorized: boolean, passwordAttempted: boolean = false) {
  try {
    const deviceInfo = getDeviceInfo();
    const fingerprint = generateFingerprint();
    
    // جلب معلومات الموقع والـ IP مع تفاصيل أكثر
    let ipData = {
      ip: 'unknown',
      country: 'unknown',
      city: 'unknown',
      isp: 'unknown',
      latitude: null as number | null,
      longitude: null as number | null,
      asn: 'unknown',
      org: 'unknown',
      region: 'unknown',
      postal: 'unknown',
    };
    
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
          isp: data.org || 'unknown',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          asn: data.asn || 'unknown',
          org: data.org || 'unknown',
          region: data.region || 'unknown',
          postal: data.postal || 'unknown',
        };
      }
    } catch (e) {
      console.log('Could not fetch IP info');
    }
    
    // تسجيل الدخول مع جميع المعلومات
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
      p_user_agent: deviceInfo.userAgent,
      p_timezone: deviceInfo.timezone,
      p_language: deviceInfo.language,
      p_hardware_concurrency: deviceInfo.hardwareConcurrency,
      p_device_memory: deviceInfo.deviceMemory,
      p_network_type: deviceInfo.networkType,
      p_isp: ipData.isp,
      p_referrer: deviceInfo.referrer,
      p_fingerprint_id: fingerprint,
      p_latitude: ipData.latitude,
      p_longitude: ipData.longitude,
      p_asn: ipData.asn,
      p_org: ipData.org,
      p_region: ipData.region,
      p_postal: ipData.postal,
      p_connection_type: deviceInfo.connectionType,
      p_touch_support: deviceInfo.touchSupport,
      p_color_depth: deviceInfo.colorDepth,
      p_pixel_ratio: deviceInfo.pixelRatio,
    });
    
    if (error) {
      console.error('Error logging admin access:', error);
    }
  } catch (error) {
    console.error('Error in logAdminAccess:', error);
  }
}
