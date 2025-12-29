import React from 'react';
import { Activity, Calendar, CheckCircle, Phone, Stethoscope, Utensils, Footprints } from 'lucide-react';
import { Card } from './ui';

export const RECOMMENDATIONS = {
  high_risk: [
    { text: "Segera konsultasi dengan dokter spesialis syaraf (Neurolog).", icon: Stethoscope },
    { text: "Kurangi konsumsi garam dan makanan berlemak tinggi.", icon: Utensils },
    { text: "Pantau tekanan darah secara rutin setiap pagi dan sore.", icon: Activity },
    { text: "Hubungi layanan darurat jika merasakan lemas tiba-tiba pada satu sisi tubuh.", icon: Phone }
  ],
  low_risk: [
    { text: "Pertahankan pola makan gizi seimbang dan rendah gula.", icon: CheckCircle },
    { text: "Lakukan aktivitas fisik ringan minimal 30 menit sehari.", icon: Footprints },
    { text: "Lakukan pemeriksaan kesehatan (Medical Check-up) rutin setahun sekali.", icon: Calendar }
  ]
};

export const INDONESIAN_TELEMEDICINE = [
  { name: "Halodoc", url: "https://www.halodoc.com/tanya-dokter", color: "bg-[#e0004d]" },
  { name: "Alodokter", url: "https://www.alodokter.com/cari-dokter", color: "bg-[#0077c8]" }
];

interface RecommendationSectionProps {
  isHighRisk: boolean;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({ isHighRisk }) => {
  const recommendations = isHighRisk ? RECOMMENDATIONS.high_risk : RECOMMENDATIONS.low_risk;

  return (
    <div className="space-y-6 animate-fade-in-up delay-100">
      <Card title="Rekomendasi Kesehatan">
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className={`p-2 rounded-full ${isHighRisk ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                <rec.icon size={18} />
              </div>
              <p className="text-slate-700 text-sm mt-1">{rec.text}</p>
            </div>
          ))}
          
          {isHighRisk && (
             <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                   <Activity size={18} />
                </div>
                <p className="text-slate-700 text-sm mt-1">
                   Segera kunjungi <strong>Puskesmas</strong> atau fasilitas kesehatan terdekat untuk pemeriksaan lebih lanjut.
                </p>
             </div>
          )}
        </div>
      </Card>

      {isHighRisk && (
        <Card title="Konsultasi Dokter Online">
          <p className="text-sm text-slate-500 mb-4">Hubungi dokter sekarang melalui layanan telemedicine terpercaya:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INDONESIAN_TELEMEDICINE.map((tele) => (
              <a 
                key={tele.name}
                href={tele.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${tele.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-between group`}
              >
                <span className="font-bold text-lg">{tele.name}</span>
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                   <Stethoscope size={20} />
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

