import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { HistoryItem, HistoryDetail } from '../types';
import { Card, Badge, Button } from '../components/ui';
import { ChevronLeft, Calendar, Brain } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getHistory(0, 50)
      .then(setHistory)
      .catch((err) => {
        console.error(err);
        setError('Failed to load history.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading history...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assessment History</h1>
        <p className="text-slate-500">Review your past stroke risk predictions.</p>
      </div>

      <div className="grid gap-4">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/history/${item.id}`)}
          >
            <div className="flex items-start gap-4 mb-4 md:mb-0">
               <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-primary-50 transition-colors">
                  <Brain className="h-6 w-6 text-slate-500 group-hover:text-primary-600" />
               </div>
               <div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    {item.prediction_label}
                    <Badge>{item.model_used.replace('_', ' ')}</Badge>
                  </h4>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
               </div>
            </div>
            <div className="flex items-center justify-end">
               <span className="text-primary-600 text-sm font-medium group-hover:underline">View Details &rarr;</span>
            </div>
          </div>
        ))}
        {history.length === 0 && <div className="text-center py-12 text-slate-400">No history found.</div>}
      </div>
    </div>
  );
};

export const HistoryDetailView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api.getHistoryDetail(id)
        .then(setDetail)
        .catch(err => {
           console.error(err);
           setError(err.message || 'Failed to load details');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!detail) return <div className="p-8 text-center text-red-500">Record not found.</div>;

  const getRiskPercentage = (res: HistoryDetail) => {
    const risk = res.probability["at_risk"] ?? res.probability["1"] ?? 0;
    return (risk * 100).toFixed(1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => navigate('/history')} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <Card className={`border-t-4 ${detail.prediction_score === 1 ? 'border-t-red-500' : 'border-t-green-500'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{detail.prediction_label}</h1>
            <p className="text-slate-500 text-sm">Analyzed on {new Date(detail.timestamp).toLocaleString()}</p>
          </div>
          <div className="mt-2 md:mt-0 text-right">
             <div className="text-sm text-slate-500 mb-1">Risk Probability</div>
             <div className="text-2xl font-mono font-bold text-slate-900">
               {getRiskPercentage(detail)}%
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
           <div>
             <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Model</span>
             <p className="font-medium text-slate-800 capitalize">{detail.model_used.replace('_', ' ')}</p>
           </div>
           <div>
             <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Age Input</span>
             <p className="font-medium text-slate-800">{detail.input_data.age} years</p>
           </div>
        </div>
      </Card>

      <Card title="Clinical Inputs">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           {Object.entries(detail.input_data).map(([key, value]) => {
             if (key === 'age' || key === 'stroke_risk_percentage') return null;
             return (
               <div key={key} className={`p-3 rounded-lg border ${value === 1 ? 'bg-red-50 border-red-100 text-red-800' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                 <div className="text-xs font-medium uppercase mb-1">{value === 1 ? 'Detected' : 'Absent'}</div>
                 <div className="text-sm font-medium capitalize truncate" title={key.replace(/_/g, ' ')}>
                   {key.replace(/_/g, ' ')}
                 </div>
               </div>
             )
           })}
        </div>
      </Card>
    </div>
  );
};