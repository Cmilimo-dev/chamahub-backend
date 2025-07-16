
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Smartphone, AlertTriangle, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const SecurityConfiguration = () => {
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordExpiry: 'never',
    loginHistory: true,
    dataEncryption: true,
    biometricAuth: false,
    deviceTrust: true,
    ipWhitelist: false,
    auditLogging: true
  });

  const [securityScore, setSecurityScore] = useState(7);
  const [activeDevices] = useState([
    { id: 1, device: 'iPhone 13', location: 'Nairobi, Kenya', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Chrome on Windows', location: 'Nairobi, Kenya', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Safari on Mac', location: 'Mombasa, Kenya', lastActive: '2 days ago', current: false }
  ]);

  const handleSave = () => {
    toast.success('Security settings updated successfully');
  };

  const handleEnable2FA = () => {
    // Logic to enable 2FA
    toast.success('Two-factor authentication setup initiated');
  };

  const handleChangePassword = () => {
    // Logic to change password
    toast.success('Password change initiated');
  };

  const handleDownloadData = () => {
    // Logic to download user data
    toast.success('Data export initiated. You will receive an email when ready.');
  };

  const handleDeleteAccount = () => {
    // Logic to delete account
    toast.error('Account deletion is permanent and cannot be undone');
  };

  const handleRevokeDevice = (deviceId: number) => {
    toast.success('Device access revoked successfully');
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Score
          </CardTitle>
          <CardDescription>
            Your current security posture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                <span className={getSecurityScoreColor(securityScore)}>{securityScore}/10</span>
              </div>
              <div>
                <p className={`font-medium ${getSecurityScoreColor(securityScore)}`}>
                  {getSecurityScoreLabel(securityScore)}
                </p>
                <p className="text-sm text-gray-500">
                  Enable 2FA to improve your score
                </p>
              </div>
            </div>
            <Button variant="outline">View Recommendations</Button>
          </div>
        </CardContent>
      </Card>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Manage your login and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Add an extra layer of security with 2FA</p>
            </div>
            <div className="flex items-center gap-2">
              {!settings.twoFactorEnabled && (
                <Badge variant="outline" className="text-yellow-600">Recommended</Badge>
              )}
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => {
                  setSettings({...settings, twoFactorEnabled: checked});
                  if (checked) handleEnable2FA();
                }}
              />
            </div>
          </div>

          {!settings.twoFactorEnabled && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Enable two-factor authentication to significantly improve your account security.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Biometric Authentication</Label>
              <p className="text-sm text-gray-500">Use fingerprint or face recognition</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Coming Soon</Badge>
              <Switch
                checked={settings.biometricAuth}
                onCheckedChange={(checked) => 
                  setSettings({...settings, biometricAuth: checked})
                }
                disabled
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Login Alerts</Label>
              <p className="text-sm text-gray-500">Get notified of new login attempts</p>
            </div>
            <Switch
              checked={settings.loginAlerts}
              onCheckedChange={(checked) => 
                setSettings({...settings, loginAlerts: checked})
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Session Timeout</Label>
            <Select 
              value={settings.sessionTimeout} 
              onValueChange={(value) => setSettings({...settings, sessionTimeout: value})}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Automatically log out after this period of inactivity
            </p>
          </div>

          <div className="space-y-2">
            <Label>Password Expiry</Label>
            <Select 
              value={settings.passwordExpiry} 
              onValueChange={(value) => setSettings({...settings, passwordExpiry: value})}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleChangePassword} className="w-fit">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Active Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Active Devices
          </CardTitle>
          <CardDescription>
            Manage devices that have access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{device.device}</p>
                    {device.current && (
                      <Badge variant="secondary">Current Device</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{device.location}</p>
                  <p className="text-sm text-gray-500">Last active: {device.lastActive}</p>
                </div>
                {!device.current && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRevokeDevice(device.id)}
                  >
                    Revoke Access
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>
            Control your data and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Login History</Label>
              <p className="text-sm text-gray-500">Keep a record of login attempts</p>
            </div>
            <Switch
              checked={settings.loginHistory}
              onCheckedChange={(checked) => 
                setSettings({...settings, loginHistory: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Data Encryption</Label>
              <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">Active</Badge>
              <Switch
                checked={settings.dataEncryption}
                onCheckedChange={(checked) => 
                  setSettings({...settings, dataEncryption: checked})
                }
                disabled
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Audit Logging</Label>
              <p className="text-sm text-gray-500">Log all account activities</p>
            </div>
            <Switch
              checked={settings.auditLogging}
              onCheckedChange={(checked) => 
                setSettings({...settings, auditLogging: checked})
              }
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium">Data Management</h4>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDownloadData}>
                <Download className="h-4 w-4 mr-2" />
                Download My Data
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Download a copy of your data or permanently delete your account
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-fit">
        Save Security Settings
      </Button>
    </div>
  );
};

export default SecurityConfiguration;
