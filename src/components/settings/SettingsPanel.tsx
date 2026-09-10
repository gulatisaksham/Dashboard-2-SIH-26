import React, { useState } from 'react';
import { X, Shield, Download, Trash2, Globe, AlertCircle, Plus } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
  selectedLang: string;
  setSelectedLang: (lang: string) => void;
  anomalyThreshold: number;
  setAnomalyThreshold: (val: number) => void;
  t: Record<string, string>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  onClose, 
  selectedLang, 
  setSelectedLang,
  anomalyThreshold,
  setAnomalyThreshold,
  t
}) => {
  const [profile, setProfile] = useState({ name: 'Bina Barman', age: '72' });
  const [deliveryPref, setDeliveryPref] = useState('in_app');

  const languages: { code: string; label: string; partial?: boolean }[] = [
    { code: 'English', label: 'English' },
    { code: 'Hindi (हिंदी)', label: 'Hindi' },
    { code: 'Assamese (অসমীয়া)', label: 'Assamese' },
    { code: 'Bengali (বাংলা)', label: 'Bengali', partial: true },
    { code: 'Manipuri (মৈতৈলোন্)', label: 'Manipuri', partial: true },
  ];

  const handleExport = () => {
    const dataStr = JSON.stringify({ patient: profile, threshold: anomalyThreshold, lang: selectedLang }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patient_data_export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this patient's data? This action cannot be undone.")) {
      alert("Data deleted (demo).");
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#FAF9F6] shadow-2xl z-50 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
        
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-[#E6E2DB] flex items-center justify-between z-10 shadow-sm">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#2D2422]">{t.settings || 'Settings'}</h2>
            <p className="text-[14px] text-[#6D5E5B] font-medium">{t.settingsSubtitle || 'Manage preferences & profile'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          
          <section className="space-y-4">
            <h3 className="text-[16px] font-extrabold text-[#2D2422] uppercase tracking-wider text-slate-500">{t.alertPrefTitle || 'Alert & Reminder Preferences'}</h3>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#E6E2DB] space-y-5">
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2D2422]">{t.medReminders || 'Medicine Reminders'}</p>
                  <p className="text-[13px] text-[#6D5E5B] font-medium">{t.medRemindersDesc || 'Notify when missed'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2D2422]">{t.hydrAlerts || 'Hydration Alerts'}</p>
                  <p className="text-[13px] text-[#6D5E5B] font-medium">{t.hydrAlertsDesc || 'Low intake warnings'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#2D2422]">{t.apptNotices || 'Appointment Notices'}</p>
                  <p className="text-[13px] text-[#6D5E5B] font-medium">{t.apptNoticesDesc || 'Upcoming doctor visits'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E6E2DB]">
                <label className="block text-[14px] font-bold text-[#6D5E5B] mb-2">{t.deliveryPref || 'Delivery Preference'}</label>
                <select 
                  value={deliveryPref}
                  onChange={(e) => setDeliveryPref(e.target.value)}
                  className="w-full px-4 py-2 bg-[#FAF9F6] border border-[#E6E2DB] rounded-[12px] font-bold text-[#2D2422] focus:outline-none focus:border-teal-600"
                >
                  <option value="in_app">{t.inAppDemo || 'In-App Only (Demo)'}</option>
                  <option value="push">{t.pushNotif || 'Push Notifications'}</option>
                  <option value="sms">{t.smsAlerts || 'SMS Alerts'}</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[16px] font-extrabold text-[#2D2422] uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" /> {t.anomalyThresholdTitle || 'Anomaly Threshold'}
            </h3>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#E6E2DB]">
              <p className="text-[14px] font-semibold text-[#6D5E5B] mb-4">
                {t.alertAfter || 'Alert after'} <span className="font-bold text-orange-600">{anomalyThreshold} {t.consecutiveSessions || 'consecutive'}</span> {t.belowBaseline || 'below-baseline sessions'}
              </p>
              <input 
                type="range" 
                min="2" 
                max="5" 
                step="1" 
                value={anomalyThreshold}
                onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
                className="w-full accent-teal-600"
              />
              <div className="flex justify-between text-[12px] text-[#6D5E5B] font-bold mt-2">
                <span>2 {t.sensitive || '(Sensitive)'}</span>
                <span>5 {t.lenient || '(Lenient)'}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[16px] font-extrabold text-[#2D2422] uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Globe className="w-5 h-5" /> {t.languageTitle || 'Language'}
            </h3>
            <div className="bg-white rounded-[20px] shadow-sm border border-[#E6E2DB] overflow-hidden flex flex-col">
              {languages.map((lang, idx) => (
                <button 
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-[15px] font-bold transition-colors ${idx !== languages.length - 1 ? 'border-b border-[#E6E2DB]' : ''} ${selectedLang === lang.code ? 'bg-teal-50 text-teal-800' : 'bg-white text-[#2D2422] hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    {lang.label}
                  </span>
                  {lang.partial && (
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {t.partialTranslation || 'Partial translation'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[16px] font-extrabold text-[#2D2422] uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Shield className="w-5 h-5" /> {t.dataPrivacyTitle || 'Data & Privacy'}
            </h3>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#E6E2DB] space-y-5">
              
              <div>
                <p className="font-bold text-[#2D2422] mb-2">{t.whoCanView || "Who can view this patient's data"}</p>
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                  <span className="text-[14px] font-bold text-slate-700">{t.caregiverYou || 'Caregiver (You)'}</span>
                  <span className="text-[12px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">{t.always || 'Always'}</span>
                </div>
                <button className="flex items-center justify-center w-full gap-2 py-2 border border-dashed border-teal-300 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-colors text-[14px]">
                  <Plus className="w-4 h-4" /> {t.addClinician || 'Add clinician access'}
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[13px] text-[#6D5E5B] font-medium leading-relaxed">
                  {t.dataRetention || 'Session and engagement data is retained for 12 months and can be deleted on request.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-[14px]">
                  <Download className="w-4 h-4" /> {t.exportData || 'Export Data'}
                </button>
                <button onClick={handleDelete} className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-[14px]">
                  <Trash2 className="w-4 h-4" /> {t.deleteData || 'Delete Data'}
                </button>
              </div>

            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[16px] font-extrabold text-[#2D2422] uppercase tracking-wider text-slate-500">{t.patientProfileTitle || 'Patient Profile'}</h3>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#E6E2DB] space-y-4">
              
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border-2 border-teal-600/30 flex items-center justify-center font-bold text-xl text-[#3E312F] shrink-0">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button className="text-[14px] font-bold text-teal-700 hover:underline">{t.changeAvatar || 'Change Avatar'}</button>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#6D5E5B] mb-1">{t.patientName || 'Patient Name'}</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2 bg-[#FAF9F6] border border-[#E6E2DB] rounded-[12px] font-bold text-[#2D2422] focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#6D5E5B] mb-1">{t.ageLabel || 'Age'}</label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={e => setProfile({...profile, age: e.target.value})}
                  className="w-full px-4 py-2 bg-[#FAF9F6] border border-[#E6E2DB] rounded-[12px] font-bold text-[#2D2422] focus:outline-none focus:border-teal-600"
                />
              </div>

            </div>
          </section>

          <section className="space-y-4 pb-6">
            <h3 className="text-[16px] font-extrabold text-[#2D2422] uppercase tracking-wider text-slate-500">{t.caregiverAccountTitle || 'Caregiver Account'}</h3>
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#E6E2DB] space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-[#6D5E5B] mb-1">{t.yourName || 'Your Name'}</label>
                <input 
                  type="text" 
                  defaultValue="Rahul Barman"
                  className="w-full px-4 py-2 bg-[#FAF9F6] border border-[#E6E2DB] rounded-[12px] font-bold text-[#2D2422] focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#6D5E5B] mb-1">{t.relToPatient || 'Relationship to Patient'}</label>
                <input 
                  type="text" 
                  defaultValue="Son"
                  className="w-full px-4 py-2 bg-[#FAF9F6] border border-[#E6E2DB] rounded-[12px] font-bold text-[#2D2422] focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#6D5E5B] mb-1">{t.contactEmail || 'Contact Email'}</label>
                <input 
                  type="email" 
                  defaultValue="rahul.barman@example.com"
                  className="w-full px-4 py-2 bg-[#FAF9F6] border border-[#E6E2DB] rounded-[12px] font-bold text-[#2D2422] focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};
