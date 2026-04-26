import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState({ email: true, push: false, events: true });

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-heading font-bold">Profile</h1>
      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-1 capitalize">{user.role}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user.name} onChange={(e) => updateProfile({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Major</Label>
              <Input value={user.major ?? ''} onChange={(e) => updateProfile({ major: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input value={user.year ?? ''} onChange={(e) => updateProfile({ year: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Input value={user.bio ?? ''} onChange={(e) => updateProfile({ bio: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Preferences */}
      <Card>
        <CardHeader><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="font-medium text-sm">Dark Mode</p><p className="text-xs text-muted-foreground">Toggle dark theme</p></div>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</Button>
          </div>
          <Separator />
          {Object.entries(notifs).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between">
              <div><p className="font-medium text-sm capitalize">{key} Notifications</p></div>
              <Switch checked={val} onCheckedChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Logout */}
      <Button variant="destructive" className="w-full" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
    </div>
  );
}
