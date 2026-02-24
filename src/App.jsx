import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './styles/main.scss';
import SetupScreen from './components/SetupScreen';
import LotteryScreen from './components/LotteryScreen';
import BackgroundDecorations from './components/BackgroundDecorations';

function App() {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'lottery'
  const [gameData, setGameData] = useState(null);

  const handleStart = ({ participants, participants2, roundCounts }) => {
    setGameData({ participants, participants2: participants2 || participants, roundCounts });
    setGameState('lottery');
  };

  const handleBack = () => {
    setGameState('setup');
  };

  return (
    <div className="app-wrapper">
      <BackgroundDecorations />

      {/* Screens */}
      <AnimatePresence mode="wait">
        {gameState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header only on setup screen */}
            <header className="app-header">
              <h1>2026 丙午馬年・媽祖靈感開壇</h1>
              <div className="header-divider" />
              <p className="subtitle">🐎 神聖抽獎盛典・離火運命理鑑定 🔥</p>
            </header>
            <SetupScreen onStart={handleStart} />
          </motion.div>
        )}

        {gameState === 'lottery' && gameData && (
          <motion.div
            key="lottery"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <LotteryScreen
              participants={gameData.participants}
              participants2={gameData.participants2}
              roundCounts={gameData.roundCounts}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
