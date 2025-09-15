import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, User, Screen } from '../types';
import { getNewQuestion } from '../services/quizService';
import { updateHighScore } from '../services/firebaseService';

interface GameScreenProps {
  user: User;
  onNewHighScore: (newUser: User) => void;
  onNavigate: (screen: Screen) => void;
}

type GameState = 'playing' | 'loading' | 'feedback' | 'gameOver' | 'all_questions_answered';

const LoadingSpinner: React.FC = () => (
  <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-yellow-400"></div>
);

const GameOverOverlay: React.FC<{ score: number; isNewRecord: boolean; onRestart: () => void; onSeeRanking: () => void; }> = 
({ score, isNewRecord, onRestart, onSeeRanking }) => {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-full max-w-md animate-fade-in-up">
        <h2 className="text-4xl font-extrabold text-blue-800 mb-2">게임 종료!</h2>
        {isNewRecord && <p className="text-xl font-bold text-yellow-500 mb-4">🎉 신기록 달성! 🎉</p>}
        <p className="text-gray-600 text-lg mb-6">최종 기록: <strong className="text-3xl font-bold text-black">{score}</strong> 계단</p>
        <div className="flex flex-col gap-4">
          <button onClick={onRestart} className="w-full bg-yellow-400 text-yellow-900 font-bold text-xl py-4 rounded-xl shadow-lg hover:bg-yellow-500 transform hover:-translate-y-1 transition-all">
            다시 도전하기
          </button>
          <button onClick={onSeeRanking} className="w-full bg-gray-200 text-gray-700 font-bold text-lg py-3 rounded-xl hover:bg-gray-300 transition-colors">
            랭킹 보기
          </button>
        </div>
      </div>
    </div>
  );
};

const GameScreen: React.FC<GameScreenProps> = ({ user, onNewHighScore, onNavigate }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameState, setGameState] = useState<GameState>('loading');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const fetchNewQuestion = useCallback(() => {
    setGameState('loading');
    setSelectedOption(null);
    const newQuestion = getNewQuestion(askedQuestions);
    
    if (newQuestion) {
        setAskedQuestions(prev => [...prev, newQuestion.question]);
        setCurrentQuestion(newQuestion);
        setGameState('playing');
    } else {
        setCurrentQuestion(null);
        setGameState('all_questions_answered');
    }
  }, [askedQuestions]);

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  const handleAnswer = async (selectedAnswer: string) => {
    if (!currentQuestion || gameState !== 'playing') return;

    setSelectedOption(selectedAnswer);
    setGameState('feedback');
    if (selectedAnswer === currentQuestion.answer) {
      setFeedback('correct');
      setCurrentScore(prev => prev + 1);
      setTimeout(() => {
        setFeedback(null);
        fetchNewQuestion();
      }, 1000);
    } else {
      setFeedback('incorrect');
      if (currentScore > user.score) {
        setIsNewRecord(true);
        const updatedUser = await updateHighScore(user.uid, currentScore);
        if (updatedUser) {
          onNewHighScore(updatedUser);
        }
      }
      setTimeout(() => {
        setGameState('gameOver');
      }, 1200);
    }
  };

  const handleRestart = () => {
    setCurrentScore(0);
    setAskedQuestions([]);
    setIsNewRecord(false);
    setFeedback(null);
    fetchNewQuestion();
  };
  
  const stairs = useMemo(() => {
    const relativeStairs = [];
    const baseScore = currentScore;
    for (let i = -5; i <= 5; i++) {
      relativeStairs.push(baseScore + i);
    }
    return relativeStairs.reverse();
  }, [currentScore]);

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-gradient-to-b from-sky-300 to-indigo-400 pt-20">
      {gameState === 'gameOver' && <GameOverOverlay score={currentScore} isNewRecord={isNewRecord} onRestart={handleRestart} onSeeRanking={() => onNavigate(Screen.Ranking)} />}
      
      <div className={`absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 text-6xl transition-transform duration-300 z-10 ${feedback === 'correct' ? 'scale-150' : ''}`} style={{ top: `calc(50% - ${currentScore % 20 * 20}px)` }}>
        🧑‍🎓
      </div>

      <div className="w-1/2 md:w-1/3 bg-gray-800/20 flex flex-col items-center relative overflow-hidden transition-all duration-500">
         {stairs.map((step) => (
             <div key={step} className="flex items-center justify-center w-full h-20 text-white font-bold text-lg shrink-0">
                 {step > 0 && 
                  <div className={`flex items-center justify-center w-2/3 py-2 rounded-md transition-all duration-300 ${step === currentScore + 1 ? 'bg-yellow-400 text-yellow-900 shadow-lg scale-110' : 'bg-black/20'}`}>
                    {step}층
                  </div>
                 }
            </div>
         ))}
      </div>
      
      <main className="w-1/2 md:w-2/3 flex flex-col items-center justify-center p-4 md:p-8 relative">
        {feedback && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className={`text-9xl transform transition-transform duration-300 ${gameState === 'feedback' ? 'scale-125' : 'scale-0'}`}>
              {feedback === 'correct' ? '⭕️' : '❌'}
            </div>
          </div>
        )}

        {gameState === 'loading' && <LoadingSpinner />}

        {gameState === 'all_questions_answered' && (
            <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center">
                <h2 className="text-3xl font-bold text-blue-800 mb-4">축하합니다!</h2>
                <p className="text-lg text-gray-700">준비된 모든 문제를 다 푸셨습니다!</p>
            </div>
        )}

        {(gameState === 'playing' || gameState === 'feedback') && currentQuestion && (
          <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl">
            <p className="text-center text-gray-600 mb-2 font-semibold">현재 {currentScore + 1}번째 계단 도전!</p>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
              {currentQuestion.question}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={gameState !== 'playing'}
                  className={`w-full p-4 text-lg font-semibold text-gray-700 bg-white rounded-xl border-2 transition-all duration-200 
                    ${gameState === 'feedback' && option === currentQuestion.answer ? 'bg-green-300 border-green-500' : ''}
                    ${gameState === 'feedback' && option !== currentQuestion.answer && option === selectedOption ? 'bg-red-300 border-red-500' : 'border-gray-300'}
                    hover:bg-yellow-200 hover:border-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default GameScreen;