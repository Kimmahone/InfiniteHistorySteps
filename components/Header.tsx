import React from 'react';
import { User, Screen } from '../types';
import { UserIcon, LogoutIcon } from './icons';

interface HeaderProps {
  user: User;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentScreen, onNavigate, onLogout }) => {
  const NavButton: React.FC<{ screen: Screen; label: string }> = ({ screen, label }) => (
    <button
      onClick={() => onNavigate(screen)}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
        currentScreen === screen
          ? 'bg-yellow-400 text-yellow-900 shadow-inner'
          : 'bg-white/80 hover:bg-yellow-200 text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-sky-500/80 backdrop-blur-sm shadow-lg p-3">
      <div className="container mx-auto max-w-4xl flex justify-between items-center">
        <div className="flex items-center gap-3 text-white">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white/50" />
          ) : (
            <UserIcon className="w-10 h-10 p-1.5 bg-sky-600 rounded-full" />
          )}
          <div>
            <span className="font-bold text-lg">{user.name}</span>
            <p className="text-sm opacity-90">{user.score.toLocaleString()}번째 계단</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavButton screen={Screen.Game} label="게임" />
          <NavButton screen={Screen.Ranking} label="랭킹" />
          <button
            onClick={onLogout}
            className="p-2 rounded-lg bg-white/80 hover:bg-red-200 text-gray-700 transition-colors"
            title="로그아웃"
          >
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;