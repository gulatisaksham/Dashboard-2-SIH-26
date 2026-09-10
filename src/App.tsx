import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { 
  Gamepad2, Target, Users, MapPin,
  Bell, Globe, Home, Image as ImageIcon,
  MessageSquare, Settings, FileText, ChevronDown, 
  Pill, Droplets, Stethoscope, Plus, Download, AlertCircle, X,
  TrendingUp, TrendingDown, Minus, BrainCircuit, Activity, User, Heart, Info, Map
} from 'lucide-react';
import { TRANSLATIONS } from './translations';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { EmptyState } from './components/ui/EmptyState';
import { InsightSummary } from './components/dashboard/InsightSummary';

// MOCK DATA
const gameTrendData = [
  { week: 'W1', people: 88, events: 82, places: 75 },
  { week: 'W2', people: 89, events: 80, places: 78 },
  { week: 'W3', people: 85, events: 84, places: 72 },
  { week: 'W4', people: 87, events: 80, places: 70 },
  { week: 'W5', people: 84, events: 78, places: 55 },
  { week: 'W6', people: 85, events: 75, places: 50 },
];

const donutData = [
  { name: 'Attended', value: 14 },
  { name: 'Missed', value: 2 },
];
const DONUT_COLORS = ['#0f766e', '#e2e8f0'];

const calculateTrend = (pct: number) => {
  if (pct < 50) return 'dropped';
  if (pct < 80) return 'stable';
  return 'improved';
};

type Subtask = { id: number, textKey: string, customText: string, completed: boolean };

const getRemindersData = (t: Record<string, string>, progress: {completed: number, total: number, subtasks?: Subtask[]}[]) => {
  const pct0 = Math.round((progress[0].completed/progress[0].total)*100) || 0;
  const pct1 = Math.round((progress[1].completed/progress[1].total)*100) || 0;
  const pct2 = progress[2].subtasks && progress[2].subtasks.length > 0 ? Math.round((progress[2].completed/progress[2].subtasks.length)*100) : 0;
  const pct3 = Math.round((progress[3].completed/progress[3].total)*100) || 0;
  
  return [
    { category: t.medicines, icon: <Pill className="w-5 h-5" />, completed: progress[0].completed, total: progress[0].total, label: `${progress[0].completed}/${progress[0].total} ${t.days}`, pct: pct0, trend: calculateTrend(pct0) },
    { category: t.hydration, icon: <Droplets className="w-5 h-5" />, completed: progress[1].completed, total: progress[1].total, label: `${progress[1].completed}/${progress[1].total} ${t.glasses}`, pct: pct1, trend: calculateTrend(pct1) },
    { 
      category: t.dailyActivities, 
      icon: <Activity className="w-5 h-5" />, 
      completed: progress[2].completed, 
      total: progress[2].subtasks?.length || 0, 
      label: `${progress[2].completed}/${progress[2].subtasks?.length || 0} ${t.tasks}`, 
      pct: pct2, 
      trend: calculateTrend(pct2),
      subtasks: progress[2].subtasks?.map(st => ({
        ...st,
        name: st.customText ? st.customText : t[st.textKey] || st.textKey
      }))
    },
    { category: t.medicalAppointments, icon: <Stethoscope className="w-5 h-5" />, completed: progress[3].completed, total: progress[3].total, label: `${progress[3].completed}/${progress[3].total} ${t.visits}`, pct: pct3, trend: calculateTrend(pct3) },
  ];
};

const getMemories = (t: Record<string, string>) => [
  { id: 1, title: 'Anjali\'s Wedding, 1998', category: t.familyMilestones, editor: 'Rahul', date: '2 days ago', isAI: false },
  { id: 2, title: 'Trip to Kaziranga', category: t.places, editor: 'Anjali', date: '1 week ago', isAI: true },
  { id: 3, title: 'Bihu Celebration at Home', category: t.festivals, editor: 'Rahul', date: '3 weeks ago', isAI: false },
  { id: 4, title: 'Making Pitha for Magh Bihu', category: t.dailyLife, editor: 'Anjali', date: '1 month ago', isAI: true },
  { id: 5, title: 'Old House in Guwahati', category: t.places, editor: 'Rahul', date: '2 months ago', isAI: false },
  { id: 6, title: 'Diwali 2021', category: t.festivals, editor: 'Anjali', date: '2 months ago', isAI: false },
];

function detectDomainAnomaly(data: {week: string, places: number}[], baselineLen = 4) {
  if (data.length <= baselineLen) return { isAnomaly: false, zScore: 0 };
  const baseline = data.slice(0, baselineLen).map(d => d.places);
  const mean = baseline.reduce((sum, val) => sum + val, 0) / baselineLen;
  const variance = baseline.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / baselineLen;
  const stdDev = Math.max(Math.sqrt(variance), 1);
  const currentVal = data[data.length - 1].places;
  const zScore = (currentVal - mean) / stdDev;
  return {
    isAnomaly: zScore <= -1.5,
    zScore: Number(zScore.toFixed(2))
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [anomalyThreshold, setAnomalyThreshold] = useState(3);
  const [memoryFilter, setMemoryFilter] = useState('All');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [userMemories, setUserMemories] = useState<any[]>([]);
  const [newMemoryTitle, setNewMemoryTitle] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState("familyMilestones");
  const [newMemoryPhoto, setNewMemoryPhoto] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [careProgress, setCareProgress] = useState<{completed: number, total: number, subtasks?: Subtask[]}[]>([
    { completed: 5, total: 7 },
    { completed: 6, total: 8 },
    { completed: 3, total: 5, subtasks: [
      { id: 0, textKey: 'task1', customText: '', completed: true },
      { id: 1, textKey: 'task2', customText: '', completed: true },
      { id: 2, textKey: 'task3', customText: '', completed: true },
      { id: 3, textKey: 'task4', customText: '', completed: false },
      { id: 4, textKey: 'task5', customText: '', completed: false }
    ]},
    { completed: 1, total: 1 },
  ]);
  detectDomainAnomaly(gameTrendData); // keep detection logic running silently
  
  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS['English'];
  const remindersData = getRemindersData(t, careProgress);
  const allMemoriesData = [...userMemories, ...getMemories(t)];
  
  const memories = allMemoriesData.filter(mem => {
    if (memoryFilter === 'All') return true;
    if (memoryFilter === 'People') return mem.category === t.familyMilestones;
    if (memoryFilter === 'Places') return mem.category === t.places;
    if (memoryFilter === 'Events') return mem.category === t.festivals || mem.category === t.dailyLife;
    return true;
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'ai', author: 'Game AI System', time: 'Today, 09:15 AM', textKey: 'aiAlertText', customText: undefined as string | undefined },
    { id: 2, type: 'family', author: 'Rahul', time: 'Yesterday, 06:30 PM', textKey: 'familyAlertText', customText: undefined as string | undefined }
  ]);

  const dismissAlert = (id: number) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const updateProgress = (idx: number, delta: number) => {
    setCareProgress(prev => {
      const newProgress = [...prev];
      const item = newProgress[idx];
      const newCompleted = Math.max(0, Math.min(item.total, item.completed + delta));
      newProgress[idx] = { ...item, completed: newCompleted };
      return newProgress;
    });
  };

  const toggleSubtask = (itemIdx: number, subtaskId: number) => {
    setCareProgress(prev => {
      const newProgress = [...prev];
      const item = newProgress[itemIdx];
      if (item.subtasks) {
        const newSubtasks = [...item.subtasks];
        newSubtasks[subtaskId] = { ...newSubtasks[subtaskId], completed: !newSubtasks[subtaskId].completed };
        const newCompleted = newSubtasks.filter(st => st.completed).length;
        newProgress[itemIdx] = { ...item, subtasks: newSubtasks, completed: newCompleted };
      }
      return newProgress;
    });
  };

  const [editingCategoryIdx, setEditingCategoryIdx] = useState<number | null>(null);

  const updateSubtaskText = (itemIdx: number, subtaskIdx: number, newText: string) => {
    setCareProgress(prev => {
      const newProgress = [...prev];
      if (newProgress[itemIdx].subtasks) {
        const newSubtasks = [...newProgress[itemIdx].subtasks!];
        newSubtasks[subtaskIdx] = { ...newSubtasks[subtaskIdx], customText: newText };
        newProgress[itemIdx] = { ...newProgress[itemIdx], subtasks: newSubtasks };
      }
      return newProgress;
    });
  };

  const addSubtask = (itemIdx: number) => {
    setCareProgress(prev => {
      const newProgress = [...prev];
      if (newProgress[itemIdx].subtasks) {
        const newSubtasks = [...newProgress[itemIdx].subtasks!, { id: Date.now(), textKey: '', customText: 'New Activity', completed: false }];
        newProgress[itemIdx] = { ...newProgress[itemIdx], subtasks: newSubtasks };
      }
      return newProgress;
    });
  };

  const deleteSubtask = (itemIdx: number, subtaskIdx: number) => {
    setCareProgress(prev => {
      const newProgress = [...prev];
      if (newProgress[itemIdx].subtasks) {
        const newSubtasks = [...newProgress[itemIdx].subtasks!];
        newSubtasks.splice(subtaskIdx, 1);
        const newCompleted = newSubtasks.filter(st => st.completed).length;
        newProgress[itemIdx] = { ...newProgress[itemIdx], subtasks: newSubtasks, completed: newCompleted };
      }
      return newProgress;
    });
  };

  const navButtonClass = (tabName: string) => `
    flex items-center w-full px-5 py-4 rounded-[16px] font-bold text-[17px] transition-colors min-h-[48px]
    ${activeTab === tabName 
      ? 'bg-[#5A4845] text-white shadow-sm' 
      : 'text-[#D5CDC4] hover:bg-[#4E3E3C] hover:text-white'
    }
  `;

  return (
    <div className="min-h-screen text-[#2D2422] flex" style={{ backgroundColor: '#FAF9F6', fontFamily: '"Nunito", "Inter", sans-serif' }}>
      <style>{`html { font-size: 18px !important; }`}</style>
      
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#3E312F] text-[#F3EFEA] flex-col hidden xl:flex sticky top-0 h-screen overflow-y-auto shrink-0 shadow-lg z-20">
        <div className="p-8 border-b border-white/10">
          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-4 mb-8 text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border-2 border-teal-600/30 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              <span className="text-[#3E312F] font-bold text-xl">BB</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Bina Barman</h2>
              <p className="text-[15px] font-medium text-[#D5CDC4]">{t.patient}</p>
            </div>
          </button>
          <h1 className="text-[22px] font-extrabold tracking-wide text-white opacity-90">Memory Lane</h1>
        </div>
        
        <nav className="flex-1 px-5 py-6 space-y-2.5">
          <button onClick={() => setActiveTab('home')} className={navButtonClass('home')}>
            <Home className="w-6 h-6 mr-4 opacity-90" /> {t.homeOverview}
          </button>
          <button onClick={() => setActiveTab('profile')} className={navButtonClass('profile')}>
            <User className="w-6 h-6 mr-4 opacity-90" /> {t.personalProfile}
          </button>
          <button onClick={() => setActiveTab('analytics')} className={navButtonClass('analytics')}>
            <BrainCircuit className="w-6 h-6 mr-4 opacity-90" /> {t.gameAnalytics}
          </button>
          <button onClick={() => setActiveTab('library')} className={navButtonClass('library')}>
            <ImageIcon className="w-6 h-6 mr-4 opacity-90" /> {t.memoryLibrary}
          </button>
          <button onClick={() => setActiveTab('care')} className={navButtonClass('care')}>
            <Pill className="w-6 h-6 mr-4 opacity-90" /> {t.careTracking}
          </button>
          <button onClick={() => setActiveTab('reports')} className={navButtonClass('reports')}>
            <FileText className="w-6 h-6 mr-4 opacity-90" /> {t.reports}
          </button>
          <button onClick={() => setShowSettingsPanel(true)} className={navButtonClass('settings')}>
            <Settings className="w-6 h-6 mr-4 opacity-90" /> {t.settings}
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-white border-b border-[#E6E2DB] px-8 py-5 sticky top-0 z-10 shadow-sm flex items-center justify-between min-h-[88px]">
          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-5 xl:hidden text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
             <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border-2 border-teal-600/30 flex items-center justify-center font-bold text-lg text-[#3E312F]">BB</div>
             <h2 className="text-xl font-bold text-slate-800">Bina Barman</h2>
          </button>
          <div className="hidden xl:flex items-center text-[16px] font-bold text-[#5C4F4D] bg-[#F4F1EC] px-5 py-2.5 rounded-full shadow-sm">
            <Gamepad2 className="w-5 h-5 mr-3 text-teal-700" />
            Last game played: 2 hours ago
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-3 text-slate-600 hover:bg-[#F4F1EC] rounded-full transition-colors cursor-pointer" aria-label="Notifications">
                <Bell className="w-7 h-7" />
                {alerts.length > 0 && <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-orange-600 border-2 border-white rounded-full"></span>}
              </button>
              {showNotifications && (
                <div className="absolute top-[110%] right-0 w-[400px] bg-white border-2 border-[#E6E2DB] rounded-[20px] shadow-lg overflow-hidden z-50">
                  <div className="p-4 border-b border-[#E6E2DB] flex justify-between items-center bg-[#FAF9F6]">
                    <h3 className="font-extrabold text-[#2D2422] text-[18px]">Notifications</h3>
                    <span className="text-sm font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">{alerts.length} new</span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 font-semibold">No new notifications</div>
                    ) : (
                      alerts.map(alert => (
                        <div key={alert.id} className="p-4 border-b border-[#E6E2DB] last:border-0 hover:bg-slate-50 transition-colors flex gap-4 items-start">
                           <div className={`${alert.type === 'ai' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'} p-2 rounded-xl shrink-0`}>
                             {alert.type === 'ai' ? <AlertCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                           </div>
                           <div className="flex-1">
                              <p className="text-[14px] font-bold text-slate-500 mb-1">{alert.type === 'ai' ? 'Game AI System' : alert.author} • {alert.time}</p>
                              <p className="text-[16px] font-semibold text-[#2D2422] line-clamp-2">
                                {alert.customText ? alert.customText : t[alert.textKey]}
                              </p>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center justify-between text-[16px] font-bold text-[#2D2422] bg-white border-2 border-[#E6E2DB] px-5 py-2.5 rounded-[16px] shadow-sm hover:bg-[#FAF9F6] transition-colors min-h-[48px] min-w-[220px]">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-teal-700" /> {selectedLang}
                </div>
                <ChevronDown className="w-5 h-5 ml-3 text-slate-400" />
              </button>
              {showLangMenu && (
                <div className="absolute top-[110%] right-0 w-full bg-white border-2 border-[#E6E2DB] rounded-[16px] shadow-lg overflow-hidden z-50">
                  {Object.keys(TRANSLATIONS).map(lang => (
                    <button key={lang} onClick={() => { setSelectedLang(lang); setShowLangMenu(false); }} className="w-full text-left px-5 py-3 text-[16px] font-bold text-[#2D2422] hover:bg-[#FAF9F6] transition-colors border-b border-[#E6E2DB] last:border-0">{lang}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowSettingsPanel(true)} className="p-3 text-slate-600 hover:bg-[#F4F1EC] rounded-full transition-colors cursor-pointer" aria-label="Settings">
              <Settings className="w-7 h-7" />
            </button>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-8 mt-8 mb-20 space-y-10 w-full">
          
          {/* ALERTS SECTION (Visible on all tabs) */}
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-[20px] font-extrabold text-[#2D2422] opacity-0">{t.alertsTitle}</h2>
             <button onClick={() => setShowAddNoteModal(true)} className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-2.5 rounded-[14px] font-bold flex items-center hover:bg-slate-50 transition-colors shadow-sm">
                <Plus className="w-5 h-5 mr-2" /> {t.addNote}
             </button>
          </div>
          {alerts.length > 0 && (
            <div className="space-y-4 -mt-8">
              {alerts.map(alert => (
                <div key={alert.id} className={`${alert.type === 'ai' ? 'bg-orange-50 border-orange-200/60' : 'bg-teal-50 border-teal-200/60'} border-2 p-6 rounded-[20px] shadow-sm flex items-start gap-5 relative`}>
                  <div className={`${alert.type === 'ai' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'} p-3 rounded-2xl shrink-0`}>
                    {alert.type === 'ai' ? <AlertCircle className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-extrabold ${alert.type === 'ai' ? 'text-orange-900' : 'text-teal-900'} text-[18px]`}>
                         {alert.type === 'ai' ? t.cognitiveAlert : t.familyNote}
                      </span>
                      <span className={`text-[15px] font-bold ${alert.type === 'ai' ? 'text-orange-700/80 bg-orange-100/50' : 'text-teal-700/80 bg-teal-100/50'} px-3 py-1 rounded-lg`}>
                         {alert.type === 'ai' ? 'Game AI System' : `${alert.author} (${t.son})`} • {alert.time}
                      </span>
                    </div>
                    <p className={`text-[18px] font-semibold ${alert.type === 'ai' ? 'text-orange-900' : 'text-teal-900'} leading-relaxed`}>
                      {alert.customText ? alert.customText : t[alert.textKey]}
                    </p>
                  </div>
                  <button onClick={() => dismissAlert(alert.id)} className={`p-3 ${alert.type === 'ai' ? 'text-orange-700 hover:bg-orange-100' : 'text-teal-700 hover:bg-teal-100'} rounded-xl transition-colors shrink-0`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: HOME */}
          {activeTab === 'home' && (
            <div className="animate-in fade-in duration-300 space-y-10">
              <InsightSummary />
              <div className="mb-6">
                <h2 className="text-[28px] font-extrabold text-[#2D2422]">{t.homeOverview}</h2>
                <p className="text-[17px] font-semibold text-[#6D5E5B] mt-1">{t.overviewDesc}</p>
              </div>

              {/* Stat Cards Snippet */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E6E2DB] flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-7 h-7 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#6D5E5B] mb-0.5">{t.gamesPlayed} <span className="text-[13px] text-slate-400 font-bold block">{t.thisMonth}</span></p>
                    <p className="text-3xl font-extrabold text-[#2D2422]">14<span className="text-[16px] font-bold text-slate-400 ml-1">/16</span></p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E6E2DB] flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <Target className="w-7 h-7 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#6D5E5B] mb-0.5">{t.totalAccuracy} <span className="text-[13px] text-slate-400 font-bold block">{t.thisWeek}</span></p>
                    <p className="text-3xl font-extrabold text-[#2D2422]">70%</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E6E2DB] flex items-center gap-5 border-l-4 border-l-teal-600">
                  <div className="w-14 h-14 rounded-full bg-[#F4F1EC] flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-[#5C4F4D]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#6D5E5B] mb-0.5">{t.peopleRecall} <span className="text-[13px] text-slate-400 font-bold block">{t.thisWeek}</span></p>
                    <p className="text-3xl font-extrabold text-[#2D2422]">85%</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-orange-300 flex items-center gap-5 border-l-4 border-l-amber-500 bg-orange-50/30">
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-7 h-7 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-orange-900 mb-0.5">{t.placesRecall} <span className="text-[13px] text-orange-700/60 font-bold block">{t.thisWeek}</span></p>
                    <p className="text-3xl font-extrabold text-orange-900">50%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 {/* Mini Chart */}
                 <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB]">
                    <h3 className="text-[22px] font-extrabold text-[#2D2422] mb-6">{t.recentGameAccuracy}</h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gameTrendData.slice(-4)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={10}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E6E2DB" />
                          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#6D5E5B', fontSize: 14, fontWeight: 700}} />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6D5E5B', fontSize: 14, fontWeight: 700}} />
                          <Tooltip cursor={{fill: '#F4F1EC'}} />
                          <Bar name={t.people} dataKey="people" fill="#0f766e" radius={[2, 2, 0, 0]} />
                          <Bar name={t.events} dataKey="events" fill="#64748b" radius={[2, 2, 0, 0]} />
                          <Bar name={t.places} dataKey="places" fill="#d97706" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
                 {/* Mini Care Tracking */}
                 <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB]">
                    <h3 className="text-[22px] font-extrabold text-[#2D2422] mb-6">{t.careTrackingToday}</h3>
                    <div className="space-y-4">
                      {remindersData.slice(0,2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-[16px] border border-[#E6E2DB]">
                           <div className="bg-teal-100/50 text-teal-800 p-3 rounded-[12px]">{item.icon}</div>
                           <div className="flex-1">
                             <p className="text-[17px] font-extrabold text-[#2D2422]">{item.category}</p>
                             <div className="w-full bg-stone-200/80 rounded-full h-2 mt-2"><div className="bg-teal-600 h-full rounded-full" style={{ width: `${item.pct}%` }}></div></div>
                           </div>
                           <span className="text-[17px] font-extrabold text-teal-800 w-16 text-right">{item.label}</span>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PROFILE */}
          {activeTab === 'profile' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-[28px] font-extrabold text-[#2D2422]">{t.personalProfile}</h2>
                <p className="text-[17px] font-semibold text-[#6D5E5B] mt-1">{t.profileDesc}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB] text-center">
                    <div className="w-32 h-32 rounded-full bg-stone-200 border-4 border-white shadow-md mx-auto mb-6 flex items-center justify-center overflow-hidden">
                       <span className="text-[40px] font-bold text-stone-500">BB</span>
                    </div>
                    <h3 className="text-[26px] font-extrabold text-[#2D2422]">Bina Barman</h3>
                    <p className="text-[18px] font-bold text-[#6D5E5B] mt-1 mb-4">{t.ageLocation}</p>
                    <p className="text-[16px] font-semibold text-slate-700 bg-[#FAF9F6] p-4 rounded-[16px] italic border border-slate-200 text-left">
                      {t.bio}
                    </p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB]">
                    <h3 className="text-[20px] font-extrabold text-[#2D2422] mb-5 flex items-center"><Info className="w-5 h-5 mr-3 text-teal-700" /> {t.healthBasics}</h3>
                    <div className="space-y-4">
                      <div><p className="text-[14px] font-bold text-slate-500">{t.diagnosisTitle}</p><p className="text-[16px] font-extrabold text-[#2D2422]">{t.diagnosisVal}</p></div>
                      <div><p className="text-[14px] font-bold text-slate-500">{t.allergiesTitle}</p><p className="text-[16px] font-extrabold text-[#2D2422]">{t.allergiesVal}</p></div>
                      <div><p className="text-[14px] font-bold text-slate-500">{t.doctorTitle}</p><p className="text-[16px] font-extrabold text-[#2D2422]">{t.doctorVal}</p></div>
                      <div><p className="text-[14px] font-bold text-slate-500">{t.emergencyTitle}</p><p className="text-[16px] font-extrabold text-[#2D2422]">{t.emergencyVal}</p></div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[20px] font-extrabold text-[#2D2422] flex items-center"><Heart className="w-5 h-5 mr-3 text-rose-600" /> {t.familyTitle}</h3>
                      <button className="text-teal-700 font-bold flex items-center bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors"><Plus className="w-5 h-5 mr-1"/> {t.addPerson}</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-[16px] border border-[#E6E2DB]">
                        <div className="w-14 h-14 rounded-full bg-stone-300 shrink-0"></div>
                        <div><p className="text-[18px] font-extrabold text-[#2D2422]">Rahul</p><p className="text-[15px] font-bold text-slate-500">{t.son}</p></div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-[16px] border border-[#E6E2DB]">
                        <div className="w-14 h-14 rounded-full bg-stone-300 shrink-0"></div>
                        <div><p className="text-[18px] font-extrabold text-[#2D2422]">Anjali</p><p className="text-[15px] font-bold text-slate-500">{t.daughter}</p></div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-[16px] border border-[#E6E2DB]">
                        <div className="w-14 h-14 rounded-full bg-stone-300 shrink-0"></div>
                        <div><p className="text-[18px] font-extrabold text-[#2D2422]">Sunita</p><p className="text-[15px] font-bold text-slate-500">{t.caregiver}</p></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB]">
                    <h3 className="text-[20px] font-extrabold text-[#2D2422] mb-6 flex items-center"><Map className="w-5 h-5 mr-3 text-teal-700" /> {t.homeRoutineTitle}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><p className="text-[14px] font-bold text-slate-500">{t.addressTitle}</p><p className="text-[16px] font-extrabold text-[#2D2422]">{t.addressVal}</p></div>
                      <div><p className="text-[14px] font-bold text-slate-500">{t.langTitle}</p><p className="text-[16px] font-extrabold text-[#2D2422]">{t.langVal}</p></div>
                      <div className="md:col-span-2"><p className="text-[14px] font-bold text-slate-500">{t.routineTitle}</p><p className="text-[16px] font-extrabold text-[#2D2422]">{t.routineVal}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-300">
              <InsightSummary />
              <div className="mb-6">
                <h2 className="text-[28px] font-extrabold text-[#2D2422]">{t.gameAnalytics}</h2>
                <p className="text-[17px] font-semibold text-[#6D5E5B] mt-1">{t.analyticsDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E6E2DB] flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-7 h-7 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#6D5E5B] mb-0.5">{t.gamesPlayed} <span className="text-[13px] text-slate-400 font-bold block">{t.thisMonth}</span></p>
                    <p className="text-3xl font-extrabold text-[#2D2422]">14<span className="text-[16px] font-bold text-slate-400 ml-1">/16</span></p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E6E2DB] flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <Target className="w-7 h-7 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#6D5E5B] mb-0.5">{t.totalAccuracy} <span className="text-[13px] text-slate-400 font-bold block">{t.thisWeek}</span></p>
                    <p className="text-3xl font-extrabold text-[#2D2422]">70%</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#E6E2DB] flex items-center gap-5 border-l-4 border-l-teal-600">
                  <div className="w-14 h-14 rounded-full bg-[#F4F1EC] flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-[#5C4F4D]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#6D5E5B] mb-0.5">{t.peopleRecall} <span className="text-[13px] text-slate-400 font-bold block">{t.thisWeek}</span></p>
                    <p className="text-3xl font-extrabold text-[#2D2422]">85%</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-orange-300 border-l-4 border-l-amber-500 bg-orange-50/30">
                  <div className="flex items-center gap-5 mb-3">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-7 h-7 text-orange-700" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-orange-900 mb-0.5">{t.placesRecall} <span className="text-[13px] text-orange-700/60 font-bold block">{t.thisWeek}</span></p>
                      <p className="text-3xl font-extrabold text-orange-900">50%</p>
                    </div>
                  </div>
                  <div className="bg-amber-100/50 p-2.5 rounded-[12px] flex items-center gap-2 border border-amber-200/60">
                     <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                     <p className="text-[13px] font-bold text-amber-900 leading-tight">{t.placesZScore}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB] flex flex-col">
                  <div className="mb-8 flex justify-between items-end">
                    <div>
                      <h3 className="text-[22px] font-extrabold text-[#2D2422]">{t.recallAccuracyTrends}</h3>
                      <p className="text-[16px] font-semibold text-[#6D5E5B] mt-1">{t.comparingPerformance}</p>
                    </div>
                  </div>
                  <div className="h-[340px] w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gameTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={2} barSize={14}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E6E2DB" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#6D5E5B', fontSize: 16, fontWeight: 700}} tickMargin={12} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#6D5E5B', fontSize: 16, fontWeight: 700}} />
                        <Tooltip cursor={{fill: '#F4F1EC'}} contentStyle={{ borderRadius: '16px', border: '1px solid #E6E2DB', fontWeight: 700 }} />
                        <Legend verticalAlign="top" height={50} wrapperStyle={{ fontSize: '16px', fontWeight: 700, color: '#2D2422' }} iconType="circle" />
                        <Bar name={t.people} dataKey="people" fill="#0f766e" radius={[4, 4, 0, 0]} />
                        <Bar name={t.events} dataKey="events" fill="#64748b" radius={[4, 4, 0, 0]} />
                        <Bar name={t.places} dataKey="places" fill="#d97706" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#E6E2DB] flex flex-col justify-between">
                  <div>
                    <h3 className="text-[22px] font-extrabold text-[#2D2422]">{t.totalSessionsAttended}</h3>
                    <p className="text-[16px] font-semibold text-[#6D5E5B] mt-1">{t.scheduledGames}</p>
                  </div>
                  <div className="h-[240px] w-full relative flex items-center justify-center my-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                          {donutData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[36px] font-extrabold text-teal-800">14<span className="text-[20px] text-slate-400">/16</span></span>
                       <span className="text-[16px] font-bold text-slate-500">{t.sessions}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: MEMORY LIBRARY */}
          {activeTab === 'library' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div>
                  <h2 className="text-[28px] font-extrabold text-[#2D2422]">{t.memoryLibrary}</h2>
                  <p className="text-[17px] font-semibold text-[#6D5E5B] mt-1">{t.libraryDesc}</p>
                </div>
                <button 
                  onClick={() => setShowAddMemoryModal(true)}
                  className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-4 rounded-[16px] font-bold flex items-center transition-colors shadow-sm text-lg min-h-[48px]"
                >
                  <Plus className="w-6 h-6 mr-3" /> {t.addMemory}
                </button>
              </div>

              <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                <button onClick={() => setMemoryFilter('All')} className={`${memoryFilter === 'All' ? 'bg-[#3E312F] text-white border-2 border-transparent' : 'bg-white text-slate-700 border-2 border-[#E6E2DB] hover:bg-[#FAF9F6]'} px-6 py-3 rounded-full text-[17px] font-bold whitespace-nowrap shadow-sm min-h-[44px] transition-colors`}>{t.allMemories}</button>
                <button onClick={() => setMemoryFilter('People')} className={`${memoryFilter === 'People' ? 'bg-[#3E312F] text-white border-2 border-transparent' : 'bg-white text-slate-700 border-2 border-[#E6E2DB] hover:bg-[#FAF9F6]'} px-6 py-3 rounded-full text-[17px] font-bold whitespace-nowrap shadow-sm min-h-[44px] transition-colors`}>{t.people}</button>
                <button onClick={() => setMemoryFilter('Places')} className={`${memoryFilter === 'Places' ? 'bg-[#3E312F] text-white border-2 border-transparent' : 'bg-white text-slate-700 border-2 border-[#E6E2DB] hover:bg-[#FAF9F6]'} px-6 py-3 rounded-full text-[17px] font-bold whitespace-nowrap shadow-sm min-h-[44px] transition-colors`}>{t.places}</button>
                <button onClick={() => setMemoryFilter('Events')} className={`${memoryFilter === 'Events' ? 'bg-[#3E312F] text-white border-2 border-transparent' : 'bg-white text-slate-700 border-2 border-[#E6E2DB] hover:bg-[#FAF9F6]'} px-6 py-3 rounded-full text-[17px] font-bold whitespace-nowrap shadow-sm min-h-[44px] transition-colors`}>{t.events}</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {memories.length === 0 ? (
                  <EmptyState 
                    icon={<ImageIcon size={48} color="#D5CDC4" />} 
                    message="No memories found." 
                    subMessage="Try changing the filter or add a new memory to the library."
                    className="col-span-full" 
                  />
                ) : (
                  memories.map((mem) => (
                    <div key={mem.id} className="bg-white rounded-[24px] shadow-sm border border-[#E6E2DB] overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                      <div className="h-[220px] bg-[#F4F1EC] relative flex items-center justify-center border-b border-[#E6E2DB]">
                        {mem.photoUrl ? (
                          <img src={mem.photoUrl} alt={mem.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-[#D5CDC4]" />
                        )}
                      </div>
                      <div className="p-7 flex-1 flex flex-col">
                        <div className="inline-flex items-center text-[15px] font-extrabold text-teal-800 bg-teal-100/60 px-4 py-2 rounded-xl mb-4 w-fit">
                          {mem.category}
                        </div>
                        <h3 className="text-[22px] font-bold text-[#2D2422] mb-6 leading-snug">{mem.title}</h3>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: CARE & REMINDERS */}
          {activeTab === 'care' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-[28px] font-extrabold text-[#2D2422]">{t.careTracking}</h2>
                <p className="text-[17px] font-semibold text-[#6D5E5B] mt-1">{t.careDesc}</p>
              </div>

              <section className="bg-white rounded-[24px] shadow-sm border border-[#E6E2DB] overflow-hidden mb-10">
                <div className="p-8 border-b border-[#E6E2DB] bg-[#FAF9F6]/50">
                  <h3 className="text-[22px] font-extrabold text-[#2D2422]">{t.structuredReport}</h3>
                </div>
                <div className="p-8">
                  <div className="hidden md:grid grid-cols-12 gap-6 text-[15px] font-bold text-slate-400 uppercase tracking-wider mb-5 px-4">
                    <div className="col-span-3">{t.category}</div>
                    <div className="col-span-6">{t.completionProgress}</div>
                    <div className="col-span-3 text-right">{t.trend}</div>
                  </div>
                  <div className="space-y-4">
                    {remindersData.length === 0 ? (
                      <EmptyState 
                        icon={<Activity size={48} color="#D5CDC4" />} 
                        message="No care tracking data available." 
                        subMessage="There are no structured routines defined for this patient."
                      />
                    ) : (
                      remindersData.map((item, idx) => (
                      <div key={idx} className="p-5 bg-[#FAF9F6] rounded-[20px] border border-[#E6E2DB]">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div className="col-span-3 flex items-center gap-4">
                            <div className="bg-teal-100/50 text-teal-800 p-3.5 rounded-[14px] shrink-0">
                              {item.icon}
                            </div>
                            <span className="text-[20px] font-extrabold text-[#2D2422]">{item.category}</span>
                          </div>
                          <div className="col-span-6">
                            <div className="flex justify-between items-end mb-2">
                              <div className="flex items-center gap-4">
                                <span className="text-[17px] font-extrabold text-[#5C4F4D]">{item.label}</span>
                                {!item.subtasks && (
                                  <div className="flex items-center bg-white border border-[#E6E2DB] rounded-[10px] overflow-hidden shadow-sm">
                                    <button onClick={() => updateProgress(idx, -1)} className="px-3 py-1 hover:bg-slate-50 text-slate-500 font-bold border-r border-[#E6E2DB] transition-colors">-</button>
                                    <button onClick={() => updateProgress(idx, 1)} className="px-3 py-1 hover:bg-slate-50 text-slate-500 font-bold transition-colors">+</button>
                                  </div>
                                )}
                              </div>
                              <span className="text-[18px] font-extrabold text-teal-800">{item.pct}%</span>
                            </div>
                            <div className="w-full bg-stone-200/80 rounded-full h-4 overflow-hidden border border-stone-200">
                              <div className="bg-teal-600 h-full rounded-full" style={{ width: `${item.pct}%` }}></div>
                            </div>
                          </div>
                          <div className="col-span-3 flex md:justify-end items-center">
                            {item.trend === 'improved' && <span className="flex items-center text-[17px] font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100"><TrendingUp className="w-5 h-5 mr-2" /> {t.improved}</span>}
                            {item.trend === 'dropped' && <span className="flex items-center text-[17px] font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100"><TrendingDown className="w-5 h-5 mr-2" /> {t.dropped}</span>}
                            {item.trend === 'stable' && <span className="flex items-center text-[17px] font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200"><Minus className="w-5 h-5 mr-2" /> {t.stable}</span>}
                          </div>
                        </div>
                        
                        {item.subtasks && (
                          <div className="mt-5 pt-5 border-t border-[#E6E2DB]">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[14px] font-bold text-slate-500 uppercase tracking-wider">Activities Breakdown</h4>
                              <button onClick={() => setEditingCategoryIdx(editingCategoryIdx === idx ? null : idx)} className="text-[14px] font-bold text-teal-700 hover:text-teal-800 transition-colors bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 flex items-center gap-1">
                                {editingCategoryIdx === idx ? "Save" : "Edit Tasks"}
                              </button>
                            </div>
                            
                            {editingCategoryIdx === idx ? (
                              <div className="space-y-3">
                                {item.subtasks.map((task, tidx) => (
                                  <div key={tidx} className="flex gap-2">
                                    <input 
                                      type="text" 
                                      value={task.name} 
                                      onChange={(e) => updateSubtaskText(idx, tidx, e.target.value)} 
                                      className="flex-1 px-4 py-2 bg-white border border-[#E6E2DB] rounded-xl text-[15px] font-bold text-[#2D2422] focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                    <button onClick={() => deleteSubtask(idx, tidx)} className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors border border-rose-100">Delete</button>
                                  </div>
                                ))}
                                <button onClick={() => addSubtask(idx)} className="w-full py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-700 transition-colors mt-2">
                                  + Add Activity
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-3">
                                {item.subtasks.map((task, tidx) => (
                                  <button 
                                    key={tidx} 
                                    onClick={() => toggleSubtask(idx, tidx)}
                                    className={`px-4 py-2 rounded-xl text-[15px] font-bold border transition-colors cursor-pointer shadow-sm hover:opacity-90 ${task.completed ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-[#E6E2DB] text-slate-500 hover:bg-slate-50'}`}
                                  >
                                    {task.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB CONTENT: REPORTS */}
          {activeTab === 'reports' && (
            <div className="animate-in fade-in duration-300">
              <section className="bg-white rounded-[24px] p-10 sm:p-20 text-center shadow-sm border border-[#E6E2DB]">
                <div className="max-w-2xl mx-auto">
                  <FileText className="w-20 h-20 mx-auto text-[#E6E2DB] mb-6" />
                  <h2 className="text-[32px] font-extrabold text-[#2D2422] mb-5">{t.reportsTitle}</h2>
                  <p className="text-[20px] text-[#5C4F4D] mb-10 font-semibold leading-relaxed">
                    {t.reportsDesc}
                  </p>
                  <button className="bg-teal-700 hover:bg-teal-800 text-white border-2 border-teal-700 px-10 py-5 rounded-2xl font-bold flex items-center justify-center mx-auto transition-colors shadow-md text-[20px] min-h-[56px]">
                    <Download className="w-7 h-7 mr-4" />
                    {t.downloadBtn}
                  </button>
                </div>
              </section>
            </div>
          )}



          <footer className="text-center pt-8 border-t border-[#E6E2DB]">
            <p className="text-[18px] font-bold text-[#6D5E5B]">
              {t.footerMsg}
            </p>
          </footer>

        </main>
      </div>

      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-lg p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold text-[#2D2422]">{t.addNote}</h3>
              <button onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your note here..."
              className="w-full border-2 border-[#E6E2DB] rounded-[16px] p-4 h-32 mb-6 focus:outline-none focus:border-teal-600 resize-none font-medium text-[16px] text-[#2D2422]"
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => { setShowAddNoteModal(false); setNoteText(''); }} className="px-6 py-3 rounded-[14px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => {
                if (noteText.trim()) {
                  setAlerts([{
                    id: Date.now(),
                    type: 'family',
                    author: 'You',
                    time: 'Just now',
                    textKey: 'customNote',
                    customText: noteText
                  }, ...alerts]);
                  setNoteText('');
                  setShowAddNoteModal(false);
                }
              }} className="px-6 py-3 rounded-[14px] font-bold bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-sm">
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddMemoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-lg p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold text-[#2D2422]">{t.addMemory}</h3>
              <button onClick={() => setShowAddMemoryModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-[#6D5E5B] font-bold mb-2">Title</label>
              <input
                type="text"
                value={newMemoryTitle}
                onChange={(e) => setNewMemoryTitle(e.target.value)}
                placeholder="Memory Title"
                className="w-full border-2 border-[#E6E2DB] rounded-[16px] p-4 focus:outline-none focus:border-teal-600 font-medium text-[16px] text-[#2D2422]"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[#6D5E5B] font-bold mb-2">Category</label>
              <select
                value={newMemoryCategory}
                onChange={(e) => setNewMemoryCategory(e.target.value)}
                className="w-full border-2 border-[#E6E2DB] rounded-[16px] p-4 focus:outline-none focus:border-teal-600 font-medium text-[16px] text-[#2D2422] bg-white appearance-none"
              >
                <option value="familyMilestones">{t.familyMilestones}</option>
                <option value="places">{t.places}</option>
                <option value="festivals">{t.festivals}</option>
                <option value="dailyLife">{t.dailyLife}</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-[#6D5E5B] font-bold mb-2">Photo (Optional)</label>
              <div className="flex items-center gap-4">
                {newMemoryPhoto && (
                  <img src={newMemoryPhoto} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-[#E6E2DB]" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setNewMemoryPhoto(url);
                    }
                  }}
                  className="w-full border-2 border-[#E6E2DB] rounded-[16px] p-3 focus:outline-none focus:border-teal-600 font-medium text-[14px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => { setShowAddMemoryModal(false); setNewMemoryTitle(''); setNewMemoryPhoto(null); }} className="px-6 py-3 rounded-[14px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => {
                if (newMemoryTitle.trim()) {
                  const newMem = {
                    id: Date.now(),
                    title: newMemoryTitle,
                    category: t[newMemoryCategory],
                    editor: 'You',
                    date: 'Just now',
                    isAI: false,
                    photoUrl: newMemoryPhoto
                  };
                  setUserMemories([newMem, ...userMemories]);
                  setNewMemoryTitle('');
                  setNewMemoryPhoto(null);
                  setShowAddMemoryModal(false);
                }
              }} className="px-6 py-3 rounded-[14px] font-bold bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-sm">
                {t.addMemory}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsPanel && (
        <SettingsPanel 
          onClose={() => setShowSettingsPanel(false)}
          selectedLang={selectedLang}
          setSelectedLang={setSelectedLang}
          anomalyThreshold={anomalyThreshold}
          setAnomalyThreshold={setAnomalyThreshold}
          t={t}
        />
      )}

    </div>
  );
}
