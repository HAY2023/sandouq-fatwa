import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Trash2, Ban, UserX, ArrowRight, RefreshCw } from 'lucide-react';

interface SecurityLog {
  id: string;
  accessed_at: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  is_authorized: boolean | null;
  password_attempted: boolean | null;
  fingerprint_id: string | null;
  isp: string | null;
  org: string | null;
  timezone: string | null;
  language: string | null;
}

interface BlockedUser {
  id: string;
  ip_address: string | null;
  fingerprint_id: string | null;
  reason: string | null;
  blocked_at: string;
}

export default function SecurityLogs() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_security_password', {
        input_password: password
      });
      
      if (error) throw error;
      
      if (data) {
        setIsAuthenticated(true);
        loadData();
      } else {
        toast({ title: 'خطأ', description: 'كلمة المرور غير صحيحة', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء التحقق', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // جلب السجلات
      const { data: logsData } = await supabase.rpc('get_security_logs_authenticated', {
        p_password: password
      });
      if (logsData) setLogs(logsData as SecurityLog[]);

      // جلب المحظورين
      const { data: blockedData } = await supabase.rpc('get_blocked_users_authenticated', {
        p_password: password
      });
      if (blockedData) setBlockedUsers(blockedData as BlockedUser[]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleBlockUser = async (log: SecurityLog) => {
    try {
      const { data, error } = await supabase.rpc('block_user_authenticated', {
        p_password: password,
        p_ip_address: log.ip_address || '',
        p_fingerprint_id: log.fingerprint_id || '',
        p_reason: `Blocked from security logs - ISP: ${log.isp || 'Unknown'}`
      });
      
      if (error) throw error;
      
      if (data) {
        toast({ title: 'تم الحظر', description: 'تم حظر المستخدم بنجاح' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حظر المستخدم', variant: 'destructive' });
    }
  };

  const handleUnblockUser = async (blockedId: string) => {
    try {
      const { data, error } = await supabase.rpc('unblock_user_authenticated', {
        p_password: password,
        p_blocked_id: blockedId
      });
      
      if (error) throw error;
      
      if (data) {
        toast({ title: 'تم إلغاء الحظر', description: 'تم إلغاء حظر المستخدم بنجاح' });
        loadData();
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في إلغاء الحظر', variant: 'destructive' });
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { data, error } = await supabase.rpc('delete_access_log_authenticated', {
        p_password: password,
        p_log_id: logId
      });
      
      if (error) throw error;
      
      if (data) {
        toast({ title: 'تم الحذف', description: 'تم حذف السجل بنجاح' });
        setLogs(logs.filter(l => l.id !== logId));
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حذف السجل', variant: 'destructive' });
    }
  };

  const detectVpnIndicators = (log: SecurityLog): string[] => {
    const indicators: string[] = [];
    
    const vpnIsps = ['vpn', 'proxy', 'hosting', 'datacenter', 'cloud', 'server', 'digital ocean', 'aws', 'azure', 'google cloud', 'linode', 'vultr', 'ovh'];
    if (log.isp && vpnIsps.some(v => log.isp!.toLowerCase().includes(v))) {
      indicators.push('ISP مشبوه');
    }
    if (log.org && vpnIsps.some(v => log.org!.toLowerCase().includes(v))) {
      indicators.push('مؤسسة مشبوهة');
    }
    
    // التحقق من عدم تطابق المنطقة الزمنية
    if (log.timezone && log.country) {
      const timezoneCountry = log.timezone.split('/')[0];
      if (timezoneCountry && !log.country.toLowerCase().includes(timezoneCountry.toLowerCase())) {
        indicators.push('عدم تطابق المنطقة الزمنية');
      }
    }
    
    return indicators;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">سجل الحماية</CardTitle>
            <p className="text-muted-foreground mt-2">أدخل كلمة المرور للوصول</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="pr-10"
              />
            </div>
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? 'جاري التحقق...' : 'دخول'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')} className="w-full">
              <ArrowRight className="ml-2 w-4 h-4" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold">سجل الحماية</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" size="icon">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              العودة
            </Button>
          </div>
        </div>

        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="logs">سجلات الدخول ({logs.length})</TabsTrigger>
            <TabsTrigger value="blocked">المحظورين ({blockedUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  سجلات محاولات الدخول
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>الموقع</TableHead>
                        <TableHead>الجهاز</TableHead>
                        <TableHead>ISP</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>مؤشرات VPN</TableHead>
                        <TableHead>إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => {
                        const vpnIndicators = detectVpnIndicators(log);
                        return (
                          <TableRow key={log.id} className={vpnIndicators.length > 0 ? 'bg-destructive/5' : ''}>
                            <TableCell className="whitespace-nowrap text-sm">
                              {new Date(log.accessed_at).toLocaleString('ar-SA')}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{log.ip_address || '-'}</TableCell>
                            <TableCell>
                              {log.country && log.city ? `${log.city}, ${log.country}` : log.country || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.device_type} - {log.browser}
                            </TableCell>
                            <TableCell className="text-sm max-w-[150px] truncate" title={log.isp || ''}>
                              {log.isp || '-'}
                            </TableCell>
                            <TableCell>
                              {log.is_authorized ? (
                                <Badge variant="default" className="bg-green-500">مصرح</Badge>
                              ) : log.password_attempted ? (
                                <Badge variant="destructive">فشل</Badge>
                              ) : (
                                <Badge variant="secondary">زيارة</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {vpnIndicators.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {vpnIndicators.map((indicator, i) => (
                                    <Badge key={i} variant="destructive" className="text-xs">
                                      {indicator}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-green-600">نظيف</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleBlockUser(log)}
                                  title="حظر"
                                  className="h-8 w-8 text-orange-500 hover:text-orange-600"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteLog(log.id)}
                                  title="حذف"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  المستخدمين المحظورين
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blockedUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">لا يوجد مستخدمين محظورين</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>تاريخ الحظر</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Fingerprint</TableHead>
                          <TableHead>السبب</TableHead>
                          <TableHead>إجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blockedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(user.blocked_at).toLocaleString('ar-SA')}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{user.ip_address || '-'}</TableCell>
                            <TableCell className="font-mono text-xs max-w-[150px] truncate">
                              {user.fingerprint_id || '-'}
                            </TableCell>
                            <TableCell>{user.reason || '-'}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnblockUser(user.id)}
                              >
                                إلغاء الحظر
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
