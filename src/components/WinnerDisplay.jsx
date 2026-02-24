/* eslint-disable react-hooks/purity */
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomDivination } from '../data/lotteryData';

// Generate confetti pieces on mount
function Confetti({ count = 80 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 3}s`,
    color: ['#FFD700', '#FF6B00', '#FF215D', '#FFF0A0', '#FF8C00', '#DC143C'][Math.floor(Math.random() * 6)],
    type: ['circle', 'rect', 'star'][Math.floor(Math.random() * 3)],
    size: 6 + Math.random() * 10,
  }));

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div
          key={p.id}
          className={`confetti-piece ${p.type}`}
          style={{
            left: p.left,
            background: p.type !== 'star' ? p.color : 'transparent',
            animationDuration: p.duration,
            animationDelay: p.delay,
            width: p.type !== 'star' ? p.size : undefined,
            height: p.type !== 'star' ? p.size : undefined,
            color: p.color,
            fontSize: p.type === 'star' ? p.size : undefined,
          }}
        >
          {p.type === 'star' ? '⭐' : ''}
        </div>
      ))}
    </div>
  );
}

function WinnerCard({ winner, index, roundId, isGrand }) {
  const divination = winner.divination || getRandomDivination(roundId);
  
  return (
    <motion.div
      className={`winner-card${isGrand ? ' grand-prize' : ''}`}
      initial={{ opacity: 0, scale: 0.3, rotate: -15, y: -50 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
    >
      {isGrand && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, transparent 70%)',
            borderRadius: 12,
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className="winner-rank">
        {isGrand ? '🏆 得獎者' : `✨ 得獎者 #${index + 1}`}
      </div>
      <div className="winner-name">{winner.name}</div>
      {winner.birthday && (
        <div className="winner-birthday">🎂 {winner.birthday}</div>
      )}
      <div className="divination">{divination}</div>
    </motion.div>
  );
}

export { Confetti, WinnerCard };
