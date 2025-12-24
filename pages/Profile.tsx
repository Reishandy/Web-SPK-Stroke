import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, BinaryOption } from '../types';
import { Card, Button, Input } from '../components/ui';
import { User as UserIcon, CheckCircle } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: User | null;
  refreshUser: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, refreshUser }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSetupMode = searchParams.get('setup') === 'true';

  const [age, setAge] = useState(user?.personal_defaults?.age || 0);
  const [hbp, setHbp] = useState<BinaryOption>((user?.personal_defaults?.high_blood_pressure as BinaryOption) || 0);
  const [loading, setLoading] = useState(false);

  // Sync state if user data loads late
  useEffect(() => {
    if (user?.personal_defaults) {
        if (age === 0) setAge(user.personal_defaults.age || 0);
        // Don't overwrite HBP strictly as 0 is valid, but good to ensure sync
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateDefaults({ age: Number(age), high_blood_pressure: hbp });
      await refreshUser();
      if (isSetupMode) {
        // Redirect to assessment or dashboard after setup
        navigate('/dashboard');
      } else {
        alert('Defaults updated successfully');
      }
    } catch (error) {
      alert('Failed to update defaults');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {!isSetupMode && (
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.full_name}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>
      )}

      {isSetupMode && (
        <div className="text-center mb-8">
           <div className="mx-auto h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
             <UserIcon className="h-6 w-6 text-teal-600" />
           </div>
           <h1 className="text-2xl font-bold text-slate-900">Let's set up your profile</h1>
           <p className="text-slate-500 max-w-sm mx-auto">
             We need a few details to provide accurate risk assessments. These will be used as default values for every scan.
           </p>
        </div>
      )}

      <Card title="Personal Defaults" className={isSetupMode ? 'border-teal-200 shadow-md' : ''}>
        <p className="text-sm text-slate-500 mb-6">
          Set your default values here. These are required to perform risk assessments.
        </p>
        <form onSubmit={handleSave} className="space-y-6">
           <Input 
             label="Default Age" 
             type="number" 
             value={age} 
             min="1"
             max="120"
             onChange={(e) => setAge(Number(e.target.value))} 
             required
           />
           
           <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">History of Hypertension (Default)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors flex-1">
                  <input type="radio" checked={hbp === 1} onChange={() => setHbp(1)} className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                  <span className="text-sm text-slate-700 font-medium">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors flex-1">
                  <input type="radio" checked={hbp === 0} onChange={() => setHbp(0)} className="text-primary-600 focus:ring-primary-500 h-4 w-4" />
                  <span className="text-sm text-slate-700 font-medium">No</span>
                </label>
              </div>
           </div>

           <div className="pt-4 flex justify-end">
             <Button type="submit" isLoading={loading} variant={isSetupMode ? 'secondary' : 'primary'}>
               {isSetupMode ? 'Save & Continue' : 'Save Changes'}
             </Button>
           </div>
        </form>
      </Card>

      {!isSetupMode && (
        <Card className="border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-700">Session Management</h3>
              <p className="text-sm text-red-500">Sign out of your account securely.</p>
            </div>
            <Button variant="danger" onClick={handleLogout}>Log Out</Button>
          </div>
        </Card>
      )}
    </div>
  );
};