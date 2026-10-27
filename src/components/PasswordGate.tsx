import { useState, ReactNode } from 'react';
import { isDebugMode } from './CountdownGate';

const ADMIN_PASSWORD = '123456';
const SESSION_KEY = 'lottery-admin-unlocked';

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => isDebugMode() || sessionStorage.getItem(SESSION_KEY) === '1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
      setError('');
    } else {
      setError('密码错误，请重新输入');
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mb-5 shadow-lg shadow-rose-500/25">
          <i className="fa-solid fa-lock text-2xl text-white"></i>
        </div>
        <h2 className="text-xl font-bold mb-2">管理密码验证</h2>
        <p className="text-sm text-slate-400 mb-6">请输入管理密码以进入转盘管理</p>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="请输入密码"
          className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white text-center outline-none focus:border-amber-400 transition-colors mb-2"
        />
        {error && <p className="text-xs text-rose-400 mb-2">{error}</p>}
        <button
          onClick={submit}
          className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 to-rose-500 hover:opacity-90 transition-opacity shadow-lg shadow-rose-500/25"
        >
          <i className="fa-solid fa-unlock mr-1.5"></i>验证进入
        </button>
      </div>
    </div>
  );
}
