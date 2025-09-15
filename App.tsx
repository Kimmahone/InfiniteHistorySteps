import React, { useState, useEffect } from 'react';
import { User, Screen } from './types';
import * as firebaseService from './services/firebaseService';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import RankingScreen from './components/RankingScreen';
import Header from './components/Header';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Game);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const appUser = await firebaseService.getUser(user.uid);
        if (appUser) {
          setCurrentUser(appUser);
        } else {
           // This case might happen if user exists in Auth but not in Firestore.
           // Let's create a Firestore entry.
           const newUser = await firebaseService.createUserInFirestore(user);
           setCurrentUser(newUser);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    firebaseService.signOutUser();
    setCurrentUser(null);
    setCurrentScreen(Screen.Game);
  };
  
  const handleNewHighScore = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleNavigation = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100">
            <div className="w-16 h-16 border-8 border-dashed rounded-full animate-spin border-blue-500"></div>
        </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Game:
        return <GameScreen user={currentUser} onNewHighScore={handleNewHighScore} onNavigate={handleNavigation}/>;
      case Screen.Ranking:
        return <RankingScreen currentUser={currentUser} />;
      default:
        return <GameScreen user={currentUser} onNewHighScore={handleNewHighScore} onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="bg-blue-100 min-h-screen">
      <Header
        user={currentUser}
        currentScreen={currentScreen}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />
      {renderScreen()}
    </div>
  );
};

export default App;