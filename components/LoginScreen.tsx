import React, { useState } from 'react';
import { signInWithGoogle } from '../services/firebaseService';
import { GoogleIcon } from './icons';

const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // onAuthStateChanged in App.tsx will handle the user state change
    } catch (error) {
      console.error("Google Sign-In Error", error);
      setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-200 to-blue-400 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-extrabold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          무한의 한국사 계단
        </h1>
        <p className="text-blue-800 text-lg mb-8">역사 퀴즈를 풀고 가장 높은 곳에 도달하세요!</p>
        
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
          <h2 className="text-gray-700 text-lg font-bold mb-6">
            게임을 시작하려면 로그인해주세요
          </h2>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 mt-6 bg-white text-gray-700 font-bold text-xl py-4 rounded-xl shadow-lg border border-gray-300 hover:bg-gray-100 transform hover:-translate-y-1 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
          >
            <GoogleIcon className="w-7 h-7" />
            {isLoading ? '로그인 중...' : 'Google 계정으로 로그인'}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;