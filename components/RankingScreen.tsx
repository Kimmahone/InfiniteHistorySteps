import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getRankings } from '../services/firebaseService';
import { CrownIcon, UserIcon } from './icons';

interface RankingScreenProps {
  currentUser: User;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-16">
        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    </div>
);

const RankingScreen: React.FC<RankingScreenProps> = ({ currentUser }) => {
  const [rankings, setRankings] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
        setIsLoading(true);
        try {
          const ranks = await getRankings();
          setRankings(ranks);
        } catch (error) {
          console.error("Failed to fetch rankings:", error);
        } finally {
          setIsLoading(false);
        }
    }
    fetchRankings();
  }, []);

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-yellow-400 text-yellow-800';
    if (index === 1) return 'bg-gray-300 text-gray-700';
    if (index === 2) return 'bg-orange-400 text-orange-800';
    return 'bg-blue-200 text-blue-800';
  };

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="container mx-auto max-w-2xl p-4">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">명예의 전당</h1>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden">
          {isLoading ? <LoadingSpinner /> : (
            <ul className="divide-y divide-gray-200">
              {rankings.map((user, index) => (
                <li
                  key={user.uid}
                  className={`flex items-center p-4 transition-colors ${
                    user.uid === currentUser.uid ? 'bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4 w-16">
                    <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-full text-sm ${getRankColor(index)}`}>
                      {index + 1}
                    </span>
                    {index < 3 && <CrownIcon className={`w-6 h-6 ${
                      index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : 'text-orange-500'
                    }`} />}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <UserIcon className="w-8 h-8 p-1 bg-gray-300 text-white rounded-full" />
                    )}
                    <span className={`font-semibold text-lg ${user.uid === currentUser.uid ? 'text-blue-700' : 'text-gray-800'}`}>
                      {user.name}
                    </span>
                  </div>
                  <span className="text-gray-600 font-bold text-lg">
                    {user.score.toLocaleString()} 계단
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingScreen;