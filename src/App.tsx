import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import WheelPage from './pages/WheelPage';
import AdminPage from './pages/AdminPage';
import { usePrizes } from './hooks/usePrizes';
import { useTickets } from './hooks/useTickets';
import { isDebugMode } from './components/CountdownGate';

export default function App() {
  const prizeStore = usePrizes();
  const ticketStore = useTickets();

  return (
    <HashRouter>
      <div className="min-h-screen relative text-white">
        <div
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80')"
          }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-rose-950/85 via-purple-950/80 to-amber-950/85" />
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'soft-light'
          }}
        />
        <header className="sticky top-0 z-40 backdrop-blur-md bg-rose-950/50 border-b border-amber-200/15">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-amber-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <i className="fa-solid fa-cake-candles text-white text-sm"></i>
              </div>
              <h1 className="text-lg font-bold tracking-wide">生日礼物抽奖</h1>
              {isDebugMode() && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 animate-pulse">
                  <i className="fa-solid fa-bug mr-1"></i>调试模式
                </span>
              )}
            </div>
            <nav className="flex items-center gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-amber-300 shadow-inner'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <i className="fa-solid fa-dharmachakra mr-1.5"></i>抽奖
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-amber-300 shadow-inner'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <i className="fa-solid fa-sliders mr-1.5"></i>转盘管理
              </NavLink>
            </nav>
          </div>
        </header>
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<WheelPage prizeStore={prizeStore} ticketStore={ticketStore} />} />
            <Route path="/admin" element={<AdminPage prizeStore={prizeStore} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
