import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Search, 
  History, 
  User, 
  MapPin, 
  Calendar, 
  Droplet, 
  Bell, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  LogOut,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { differenceInDays, parseISO, format, isValid } from 'date-fns';
import { cn } from './lib/utils';
import { BloodGroup, Donor, DonationRecord } from './types';
import { BLOOD_GROUPS, ELIGIBILITY_DAYS, MOCK_DONORS } from './constants';

// --- Components ---

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }) => {
  const variants = {
    primary: 'bg-brand-red text-white hover:bg-brand-red-dark shadow-md active:scale-95',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95',
    outline: 'border-2 border-brand-red text-brand-red hover:bg-brand-red/5 active:scale-95',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95',
    ghost: 'text-slate-600 hover:bg-slate-100 active:scale-95',
  };

  return (
    <button 
      className={cn(
        'px-6 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn('bg-white rounded-3xl p-6 shadow-sm border border-slate-100', className)}
  >
    {children}
  </div>
);

const Badge = ({ children, color = 'red' }: { children: React.ReactNode; color?: 'red' | 'green' | 'blue' | 'gray' }) => {
  const colors = {
    red: 'bg-red-50 text-red-600 border-red-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    gray: 'bg-slate-50 text-slate-600 border-slate-100',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold border', colors[color])}>
      {children}
    </span>
  );
};

// --- App Screens ---

export default function App() {
  const [screen, setScreen] = useState<'splash' | 'onboarding' | 'home' | 'search' | 'history' | 'profile'>('splash');
  const [user, setUser] = useState<Donor | null>(null);
  const [history, setHistory] = useState<DonationRecord[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('rv_user');
    const savedHistory = localStorage.getItem('rv_history');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    setTimeout(() => {
      setIsInitializing(false);
      if (savedUser) setScreen('home');
      else setScreen('onboarding');
    }, 1500);
  }, []);

  // Save state on change
  useEffect(() => {
    if (user) localStorage.setItem('rv_user', JSON.stringify(user));
    if (history.length > 0) localStorage.setItem('rv_history', JSON.stringify(history));
  }, [user, history]);

  const eligibility = useMemo(() => {
    if (!user) return { daysLeft: 0, isEligible: true };
    const lastDate = parseISO(user.lastDonationDate);
    if (!isValid(lastDate)) return { daysLeft: 0, isEligible: true };
    
    const daysSinceLast = differenceInDays(new Date(), lastDate);
    const daysLeft = Math.max(0, ELIGIBILITY_DAYS - daysSinceLast);
    return { daysLeft, isEligible: daysLeft === 0 };
  }, [user]);

  const handleRegister = (data: Partial<Donor>) => {
    const newUser: Donor = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Anonymous',
      bloodGroup: data.bloodGroup || 'O+',
      lastDonationDate: data.lastDonationDate || format(new Date(), 'yyyy-MM-dd'),
      location: data.location || 'Unknown',
      isReady: true,
    };
    setUser(newUser);
    setScreen('home');
  };

  const handleLogDonation = () => {
    const newRecord: DonationRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: format(new Date(), 'yyyy-MM-dd'),
      location: user?.location || 'Central Clinic',
      type: 'Regular'
    };
    setHistory([newRecord, ...history]);
    setUser(prev => prev ? { ...prev, lastDonationDate: newRecord.date } : null);
    alert('Donation logged successfully!');
  };

  const toggleReady = () => {
    setUser(prev => prev ? { ...prev, isReady: !prev.isReady } : null);
  };

  // --- Renderers ---

  if (screen === 'splash' || isInitializing) {
    return (
      <div className="fixed inset-0 bg-brand-red flex flex-col items-center justify-center text-white p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white/30">
            <Heart size={48} className="fill-white" />
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Rakta-Vahini</h1>
          <p className="text-white/80 font-medium tracking-wide italic">Life in every drop</p>
        </motion.div>
        
        <div className="absolute bottom-12 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-widest uppercase opacity-60">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative overflow-hidden pb-24 shadow-2xl">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Screen Transitions */}
      <AnimatePresence mode="wait">
        {screen === 'onboarding' && (
          <motion.div 
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <OnboardingScreen onComplete={handleRegister} />
          </motion.div>
        )}
        {screen === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeScreen 
              user={user!} 
              eligibility={eligibility} 
              toggleReady={toggleReady} 
              historyCount={history.length}
              onLogDonation={handleLogDonation}
            />
          </motion.div>
        )}
        {screen === 'search' && (
          <motion.div 
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchScreen />
          </motion.div>
        )}
        {screen === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HistoryScreen history={history} />
          </motion.div>
        )}
        {screen === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileScreen user={user!} onLogout={() => { localStorage.clear(); setScreen('onboarding'); setUser(null); setHistory([]); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      {screen !== 'onboarding' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex items-center justify-between z-50 max-w-md mx-auto rounded-t-[32px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <NavButton active={screen === 'home'} icon={<Heart />} label="Home" onClick={() => setScreen('home')} />
          <NavButton active={screen === 'search'} icon={<Search />} label="Find" onClick={() => setScreen('search')} />
          <NavButton active={screen === 'history'} icon={<History />} label="Log" onClick={() => setScreen('history')} />
          <NavButton active={screen === 'profile'} icon={<User />} label="You" onClick={() => setScreen('profile')} />
        </nav>
      )}
    </div>
  );
}

// --- Navigation ---

const NavButton = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1.5 transition-all duration-300 relative px-4',
      active ? 'text-brand-red scale-110' : 'text-slate-400'
    )}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    {active && <motion.div layoutId="nav-line" className="absolute -bottom-2 w-4 h-1 bg-brand-red rounded-full shadow-[0_0_8px_rgba(234,67,53,0.5)]" />}
  </button>
);

// --- Screen Components ---

const OnboardingScreen = ({ onComplete }: { onComplete: (data: Partial<Donor>) => void }) => {
  const [formData, setFormData] = useState<Partial<Donor>>({
    name: '',
    bloodGroup: 'O+',
    lastDonationDate: '',
    location: ''
  });

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="p-8 flex flex-col min-h-screen"
    >
      <div className="mb-10">
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Create Profile</h2>
        <p className="text-slate-500">Join our community of lifesavers. It takes less than a minute.</p>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
          <input 
            type="text" 
            placeholder="John Doe"
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all shadow-sm font-medium"
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Blood Group</label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setFormData({ ...formData, bloodGroup: bg })}
                className={cn(
                  'py-3 rounded-xl border-2 font-bold transition-all',
                  formData.bloodGroup === bg 
                    ? 'border-brand-red bg-brand-red text-white shadow-md' 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                )}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Last Donation Date</label>
          <input 
            type="date" 
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 outline-none font-medium text-slate-700"
            onChange={e => setFormData({ ...formData, lastDonationDate: e.target.value })}
          />
          <p className="mt-2 text-[10px] text-slate-400">Leave blank if you've never donated.</p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Location</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Mumbai, Maharashtra"
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 outline-none font-medium"
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
        </div>
      </div>

      <Button 
        onClick={() => onComplete(formData)}
        className="mt-10"
        disabled={!formData.name}
      >
        Save & Continue <ChevronRight size={18} />
      </Button>
    </motion.div>
  );
};

const HomeScreen = ({ 
  user, 
  eligibility, 
  toggleReady, 
  historyCount,
  onLogDonation
}: { 
  user: Donor; 
  eligibility: { daysLeft: number; isEligible: boolean }; 
  toggleReady: () => void;
  historyCount: number;
  onLogDonation: () => void;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-2">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Welcome back,</p>
          <h2 className="text-2xl font-display font-bold text-slate-900">{user.name.split(' ')[0]}</h2>
        </div>
        <div className="relative">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100 text-brand-red">
            <Bell size={24} />
          </div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-slate-50 rounded-full" />
        </div>
      </header>

      {/* Main Status */}
      <Card className={cn(
        "relative overflow-hidden border-none shadow-xl transition-all duration-500",
        eligibility.isEligible ? "bg-brand-red text-white" : "bg-slate-900 text-white"
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
              <Droplet size={14} className="fill-current" />
              <span className="text-xs font-bold tracking-widest">{user.bloodGroup}</span>
            </div>
            {eligibility.isEligible ? (
              <CheckCircle2 size={32} className="text-white/40" />
            ) : (
              <AlertCircle size={32} className="text-white/40" />
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold opacity-80 mb-1">Status</h3>
            <p className="text-4xl font-display font-bold leading-tight">
              {eligibility.isEligible ? 'You can donate now!' : `${eligibility.daysLeft} Days to go`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (ELIGIBILITY_DAYS - eligibility.daysLeft) / ELIGIBILITY_DAYS * 100)}%` }}
                  className="h-full bg-white shadow-[0_0_10px_white]" 
                />
              </div>
            </div>
            <span className="text-[10px] font-black uppercase opacity-60">Eligible</span>
          </div>
        </div>
      </Card>

      {/* Ready Toggle */}
      <Card className="flex items-center justify-between py-4 group hover:bg-slate-50/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-2xl transition-all",
            user.isReady ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"
          )}>
            <Heart className={cn(user.isReady && "fill-current")} size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 leading-none mb-1">Ready to Donate</h4>
            <p className="text-xs text-slate-400 font-medium">Visible to recipients nearby</p>
          </div>
        </div>
        <button onClick={toggleReady} className="p-2">
          {user.isReady ? (
            <ToggleRight size={48} className="text-brand-red " strokeWidth={1} />
          ) : (
            <ToggleLeft size={48} className="text-slate-200" strokeWidth={1} />
          )}
        </button>
      </Card>

      {/* Stats & Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-blue-50/50 border-blue-100 flex flex-col justify-between">
          <div className="text-blue-600 mb-2">
            <History size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{historyCount}</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Donations</p>
          </div>
        </Card>
        <Card className="bg-orange-50/50 border-orange-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform" onClick={onLogDonation}>
          <div className="text-orange-600 mb-2">
            <Plus size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Log Donation</p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Keep record</p>
          </div>
        </Card>
      </div>

      {/* Nearby Activity */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-display font-bold text-slate-900">Upcoming Drives</h3>
          <button className="text-[10px] font-black uppercase text-brand-red tracking-widest">See All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: 1, title: 'Central Hospital', date: 'Oct 24', time: '10 AM' },
            { id: 2, title: 'V-Mall Drive', date: 'Oct 26', time: '12 PM' },
            { id: 3, title: 'Tech Park Camp', date: 'Oct 30', time: '9 AM' },
          ].map(drive => (
            <div key={drive.id} className="min-w-[160px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="text-brand-red mb-2">
                <MapPin size={16} />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">{drive.title}</h4>
              <p className="text-[10px] text-slate-400 font-medium">{drive.date} • {drive.time}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SearchScreen = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | null>('O+');
  const [isSearching, setIsSearching] = useState(false);

  const eligibleDonors = useMemo(() => {
    return MOCK_DONORS.filter(d => 
      (!selectedGroup || d.bloodGroup === selectedGroup) && 
      differenceInDays(new Date(), parseISO(d.lastDonationDate)) >= ELIGIBILITY_DAYS &&
      d.isReady
    );
  }, [selectedGroup]);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <header>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Find Donors</h2>
        <p className="text-sm text-slate-500">Search for eligible donors ready for emergency response.</p>
      </header>

      <Card>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {BLOOD_GROUPS.map(bg => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(bg)}
              className={cn(
                'py-2.5 rounded-xl border text-sm font-bold transition-all',
                selectedGroup === bg 
                  ? 'border-brand-red bg-brand-red text-white shadow-md' 
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
              )}
            >
              {bg}
            </button>
          ))}
        </div>
        <Button className="w-full" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search size={20} /> Search Nearby</>}
        </Button>
      </Card>

      <div className="space-y-4">
        <h3 className="font-display font-bold text-slate-900 px-1">Nearby Results ({eligibleDonors.length})</h3>
        
        {eligibleDonors.length > 0 ? (
          <div className="space-y-3">
            {eligibleDonors.map(donor => (
              <motion.div 
                key={donor.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="flex items-center justify-between p-4 px-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-display font-bold text-brand-red text-lg">
                      {donor.bloodGroup}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{donor.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-0.5">
                          <MapPin size={10} /> {donor.location}
                        </span>
                        <Badge color="green">Ready</Badge>
                      </div>
                    </div>
                  </div>
                  <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform">
                    <Bell size={18} />
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No active donors found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const HistoryScreen = ({ history }: { history: DonationRecord[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <header>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">History</h2>
        <p className="text-sm text-slate-500">Keep track of your life-saving contributions.</p>
      </header>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((record, idx) => (
            <div key={record.id} className="relative pl-6 border-l-2 border-slate-100 pb-6 last:pb-0">
              <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-2 border-brand-red rounded-full" />
              <Card className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-slate-900">Day of Heroism #{history.length - idx}</p>
                  <Badge color="blue">{record.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {record.date}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {record.location}</span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-slate-300">
          <Heart size={48} className="mb-4 opacity-20" />
          <p className="font-bold uppercase tracking-widest text-xs">No donations yet</p>
          <p className="text-[10px] mt-2 font-medium">Be a hero. Start your journey.</p>
        </div>
      )}
    </motion.div>
  );
};

const ProfileScreen = ({ user, onLogout }: { user: Donor, onLogout: () => void }) => {
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-6 space-y-8"
    >
      <header className="flex flex-col items-center text-center mt-6">
        <div className="w-24 h-24 bg-brand-red/10 border-4 border-white rounded-full flex items-center justify-center text-brand-red mb-4 shadow-xl">
          <User size={48} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-900">{user.name}</h2>
        <p className="text-slate-500 italic mt-1">{user.location}</p>
        
        <div className="flex gap-2 mt-6">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 pb-1">Group</p>
            <p className="text-xl font-display font-black text-brand-red">{user.bloodGroup}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-slate-400 pb-1">Verified</p>
            <div className="flex items-center justify-center text-green-500 py-1">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><Bell size={18} /></div>
            <span className="font-bold text-sm text-slate-700">Notifications</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </div>
        <div className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><MapPin size={18} /></div>
            <span className="font-bold text-sm text-slate-700">Service Locations</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </div>
        <div className="p-4 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red"><Heart size={18} /></div>
            <span className="font-bold text-sm text-slate-700">Invite Friends</span>
          </div>
          <ChevronRight size={18} className="text-slate-300" />
        </div>
      </div>

      <Button variant="danger" className="w-full" onClick={onLogout}>
        <LogOut size={20} /> Log Out
      </Button>

      <div className="text-center">
        <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">Rakta-Vahini v1.0.0</p>
      </div>
    </motion.div>
  );
};

