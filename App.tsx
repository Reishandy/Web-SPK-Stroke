import React, {useEffect, useState} from 'react';
import {HashRouter, Link, Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {api} from './services/api';
import {User} from './types';
import {Dashboard} from './pages/Dashboard';
import {Assessment} from './pages/Assessment';
import {HistoryDetailView, HistoryList} from './pages/History';
import {Profile} from './pages/Profile';
import {Button, Input} from './components/ui';
import {
    Activity,
    ArrowRight,
    BrainCircuit,
    ClipboardList,
    HeartPulse,
    History,
    LayoutDashboard,
    Lock,
    Mail,
    Menu,
    User as UserIcon,
    UserCircle,
    X
} from 'lucide-react';

const AuthLayout: React.FC<{ children: React.ReactNode; title: string; subtitle: string }> = ({
                                                                                                  children,
                                                                                                  title,
                                                                                                  subtitle
                                                                                              }) => {
    return (
        <div className="min-h-screen flex bg-white">
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    <div className="space-y-2">
                        <div
                            className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-600/30">
                            <HeartPulse size={24}/>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
                        <p className="text-slate-500 text-lg">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>

            <div className="hidden lg:flex flex-1 bg-primary-950 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div
                        className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
                        style={{animationDelay: '2s'}}></div>
                    <div
                        className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"
                        style={{animationDelay: '4s'}}></div>
                </div>

                <div className="relative z-10 p-12 text-white max-w-lg text-center">
                    <div
                        className="mb-8 inline-flex p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 ring-1 ring-white/20">
                        <BrainCircuit size={64} className="text-primary-300"/>
                    </div>
                    <h3 className="text-3xl font-bold mb-4">AI-Powered Stroke Prediction</h3>
                    <p className="text-primary-100 text-lg leading-relaxed">
                        NeuroGuard utilizes advanced Random Forest and SVM models to analyze clinical vitals and
                        symptoms, providing instant risk assessments to support better health decisions.
                    </p>
                </div>
            </div>
        </div>
    );
};

interface AuthProps {
    onLoginSuccess: (isNewUser?: boolean) => void;
}

const Login: React.FC<AuthProps> = ({onLoginSuccess}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.login(email, password);
            api.setToken(res.access_token);
            onLoginSuccess(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Enter your credentials to access your dashboard."
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    autoComplete="username"
                    icon={<Mail size={18}/>}
                />
                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        icon={<Lock size={18}/>}
                    />
                </div>

                {error && (
                    <div
                        className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2 animate-slide-up">
                        <Activity size={16} className="mt-0.5 shrink-0"/>
                        <span>{error}</span>
                    </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-primary-500/25 shadow-lg"
                        isLoading={loading}>
                    Sign In
                </Button>
            </form>

            <div className="pt-4 text-center">
                <p className="text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register"
                          className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

const Register: React.FC<AuthProps> = ({onLoginSuccess}) => {
    const [formData, setFormData] = useState({email: '', password: '', full_name: ''});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.register(formData);
            const res = await api.login(formData.email, formData.password);
            api.setToken(res.access_token);
            onLoginSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start monitoring patient stroke risks today."
        >
            <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                    label="Full Name"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Dr. John Doe"
                    autoComplete="name"
                    icon={<UserIcon size={18}/>}
                />
                <Input
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    autoComplete="email"
                    icon={<Mail size={18}/>}
                />
                <Input
                    label="Password"
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    icon={<Lock size={18}/>}
                />

                {error && (
                    <div
                        className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 animate-slide-up">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-primary-500/25 shadow-lg"
                        isLoading={loading}>
                    Create Account <ArrowRight size={18} className="ml-2"/>
                </Button>
            </form>

            <div className="pt-4 text-center">
                <p className="text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login"
                          className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

const SidebarLink: React.FC<{ to: string; icon: any; label: string; onClick?: () => void }> = ({
                                                                                                   to,
                                                                                                   icon: Icon,
                                                                                                   label,
                                                                                                   onClick
                                                                                               }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
            <Icon size={20}
                  className={`transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}/>
            {label}
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600"></div>}
        </Link>
    );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50">
            <div
                className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                <div className="p-8 flex items-center gap-3">
                    <div
                        className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <HeartPulse size={20}/>
                    </div>
                    <div>
                        <span
                            className="font-bold text-slate-900 text-xl tracking-tight block leading-none">NeuroGuard</span>
                        <span className="text-xs text-slate-500 font-medium">Stroke AI Risk System</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <div className="px-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu
                    </div>
                    <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard"/>
                    <SidebarLink to="/assessment" icon={ClipboardList} label="New Assessment"/>
                    <SidebarLink to="/history" icon={History} label="History"/>

                    <div
                        className="mt-8 px-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account
                    </div>
                    <SidebarLink to="/profile" icon={UserCircle} label="Profile & Settings"/>
                </nav>

                <div className="p-4 m-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-600">System Operational</span>
                    </div>
                </div>
            </div>

            <div
                className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                    <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                        <HeartPulse size={16}/>
                    </div>
                    NeuroGuard
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-transform"
                >
                    <Menu size={24}/>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    <div className="relative w-72 bg-white h-[100dvh] shadow-2xl flex flex-col animate-fade-in">
                        <div className="p-6 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                                <div
                                    className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                                    <HeartPulse size={16}/>
                                </div>
                                NeuroGuard
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                <X size={20}/>
                            </button>
                        </div>

                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            <div
                                className="px-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main
                                Menu
                            </div>
                            <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard"
                                         onClick={() => setIsMobileMenuOpen(false)}/>
                            <SidebarLink to="/assessment" icon={ClipboardList} label="New Assessment"
                                         onClick={() => setIsMobileMenuOpen(false)}/>
                            <SidebarLink to="/history" icon={History} label="History"
                                         onClick={() => setIsMobileMenuOpen(false)}/>

                            <div
                                className="mt-8 px-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Account
                            </div>
                            <SidebarLink to="/profile" icon={UserCircle} label="Profile & Settings"
                                         onClick={() => setIsMobileMenuOpen(false)}/>
                        </nav>
                    </div>
                </div>
            )}

            <main className="flex-1 md:ml-72 p-4 md:p-8 max-w-7xl mx-auto w-full relative z-10">
                <div className="animate-slide-up">
                    {children}
                </div>
            </main>
        </div>
    );
};

function AppRoutes() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchUser = async () => {
        try {
            setLoading(true);
            if (api.isAuthenticated()) {
                const userData = await api.getMe();
                setUser(userData);
            }
        } catch (e) {
            console.error("Auth check failed", e);
            api.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleLoginSuccess = async (isNewUser = false) => {
        await fetchUser();
        if (isNewUser) {
            navigate('/profile?setup=true');
        } else {
            navigate('/dashboard');
        }
    };

    if (loading) {
        return (
            <div
                className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-4">
                <div
                    className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white animate-bounce">
                    <HeartPulse size={24}/>
                </div>
                <p className="font-medium animate-pulse">Initializing NeuroGuard...</p>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login"
                   element={!user ? <Login onLoginSuccess={handleLoginSuccess}/> : <Navigate to="/dashboard"/>}/>
            <Route path="/register"
                   element={!user ? <Register onLoginSuccess={handleLoginSuccess}/> : <Navigate to="/dashboard"/>}/>

            <Route path="/" element={user ? <Navigate to="/dashboard"/> : <Navigate to="/login"/>}/>

            <Route path="/dashboard"
                   element={user ? <AppLayout><Dashboard user={user}/></AppLayout> : <Navigate to="/login"/>}/>
            <Route path="/assessment"
                   element={user ? <AppLayout><Assessment user={user}/></AppLayout> : <Navigate to="/login"/>}/>
            <Route path="/history" element={user ? <AppLayout><HistoryList/></AppLayout> : <Navigate to="/login"/>}/>
            <Route path="/history/:id"
                   element={user ? <AppLayout><HistoryDetailView/></AppLayout> : <Navigate to="/login"/>}/>
            <Route path="/profile"
                   element={user ? <AppLayout><Profile user={user} refreshUser={fetchUser}/></AppLayout> :
                       <Navigate to="/login"/>}/>
        </Routes>
    );
}

function App() {
    return (
        <HashRouter>
            <AppRoutes/>
        </HashRouter>
    );
}

export default App;