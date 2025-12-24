import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { HistoryItem, User } from '../types';
import { Card, Button, Badge } from '../components/ui';
import { Plus, History as HistoryIcon, User as UserIcon, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardProps {
  user: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getHistory(0, 10);
        setHistory(data);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const atRiskCount = history.filter(h => h.prediction_score === 1).length;
  
  // Data for chart - reversed to show chronological order left to right
  const chartData = history.slice().reverse().map((h, idx) => ({
    name: `Test ${idx + 1}`,
    score: h.prediction_score, // 0 or 1
    label: h.prediction_label,
    date: new Date(h.timestamp).toLocaleDateString()
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 border border-slate-200 shadow-xl rounded-xl text-xs">
          <p className="font-semibold text-slate-900 mb-1">{payload[0].payload.date}</p>
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${payload[0].value === 1 ? 'bg-red-500' : 'bg-green-500'}`}></div>
             <p className="text-slate-600">
               {payload[0].value === 1 ? 'High Risk detected' : 'Normal parameters'}
             </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <div 
      className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up group`} 
      style={{ animationDelay: delay }}
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-110 ${color}`}></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h4 className="mt-2 text-3xl font-bold text-slate-900">{value}</h4>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} bg-opacity-10 text-white transition-colors duration-300`}>
           <Icon className={`h-6 w-6 opacity-80 ${title.includes('Risk') ? 'text-red-600' : (title.includes('Total') ? 'text-primary-600' : 'text-teal-600')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your patient risk assessments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <UserIcon size={16} className="mr-2" /> Profile
          </Button>
          <Button onClick={() => navigate('/assessment')} className="shadow-lg shadow-primary-500/20">
            <Plus size={16} className="mr-2" /> New Assessment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard 
          title="Total Assessments" 
          value={history.length} 
          icon={Activity} 
          color="bg-primary-500" 
          delay="0s" 
        />
        <StatCard 
          title="At Risk Results" 
          value={atRiskCount} 
          icon={AlertTriangle} 
          color="bg-red-500" 
          delay="0.1s" 
        />
        <StatCard 
          title="Profile Status" 
          value={(user?.personal_defaults?.age && user.personal_defaults.age > 0) ? 'Optimized' : 'Setup Needed'} 
          icon={CheckCircle2} 
          color="bg-teal-500" 
          delay="0.2s" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Card title="Risk Trend Analysis" className="h-full min-h-[400px]">
            <div className="h-[320px] w-full mt-4">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={11} 
                      tick={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      domain={[0, 1]} 
                      ticks={[0, 1]} 
                      tickFormatter={(val) => val === 1 ? 'High Risk' : 'Normal'} 
                      fontSize={11} 
                      axisLine={false} 
                      tickLine={false}
                      width={60} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                        animationDuration={1500}
                      />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <Activity className="h-10 w-10 opacity-20 mb-2" />
                   <p className="text-sm">Not enough data to display trends.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card title="Recent Activity" className="h-full min-h-[400px]">
             {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>
             ) : history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <HistoryIcon className="h-8 w-8 opacity-20" />
                  <p className="text-sm">No assessments found.</p>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/assessment')} className="mt-2 text-primary-600">
                    Start Assessment
                  </Button>
                </div>
             ) : (
                <div className="space-y-3 mt-2">
                  {history.slice(0, 5).map((item, i) => (
                    <div 
                      key={item.id} 
                      className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all cursor-pointer"
                      onClick={() => navigate(`/history/${item.id}`)}
                      style={{ animationDelay: `${0.1 * i}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.prediction_score === 1 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`}></div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">{item.prediction_label}</span>
                          <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant={item.prediction_score === 1 ? 'risk' : 'success'}>
                         {item.prediction_score === 1 ? 'Risk' : 'Safe'}
                      </Badge>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-50">
                     <Button variant="ghost" className="w-full text-xs text-slate-500 hover:text-slate-900" onClick={() => navigate('/history')}>
                       View All History
                     </Button>
                  </div>
                </div>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
};