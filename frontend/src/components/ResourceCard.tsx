import React from 'react';
import { Resource, Language } from '../types';
import { i18n } from '../data/i18n';

interface ResourceCardProps {
  resource: Resource;
  lang: Language;
  onBookClick: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, lang, onBookClick }) => {
  const t = i18n[lang];
  const isRoom = resource.type?.toLowerCase() === 'room';
  const icon = isRoom ? '🚪' : '💻';
  const displayType = isRoom ? t.room : t.equipment;

  // ✅ เลือกชื่อตามภาษาที่ผู้ใช้เลือก (รองรับทั้งไทยและอังกฤษจาก DB)
  const displayName = lang === 'th' ? resource.nameTh : resource.nameEn;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1 flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-800 to-purple-400"></div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4 text-slate-900 flex items-center gap-2">
          {icon} {displayName || `Resource #${resource.id}`}
        </h3>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">{t.type}:</span>
            <span className="text-slate-700 font-semibold capitalize">{displayType}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">{t.status}:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              resource.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {resource.isActive ? t.available : t.unavailable}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-400">ID: {resource.id}</span>
        <button
          onClick={() => onBookClick(resource)}
          disabled={!resource.isActive}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold shadow transition ${
            resource.isActive 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {lang === 'th' ? 'จองใช้งาน' : 'Book Now'}
        </button>
      </div>
    </div>
  );
};