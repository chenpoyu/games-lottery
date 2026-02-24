import { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ROUND_CONFIGS, drawWinners, buildDivinationText, shuffleArray } from '../data/lotteryData';
import { Confetti } from './WinnerDisplay';

// ── 單人揭曉蓋板 ──────────────────────────────────────────
function WinnerRevealOverlay({ winner, roundId, rank, total, onClose, isRolling, rollingName }) {
  const isSpecial = roundId === 4;
  return (
    <motion.div
      className="overlay-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={!isRolling && onClose ? onClose : undefined}
    >
      <motion.div
        className={`reveal-panel${isSpecial ? ' reveal-panel--special' : ''}`}
        initial={{ scale: 0.3, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="reveal-rays" />
        {isRolling ? (
          <>
            <div className="reveal-rank">⚡ 天命感應中…</div>
            <motion.div
              className="reveal-name reveal-name--rolling"
              key={rollingName}
              initial={{ opacity: 0.4, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.08 }}
            >
              {rollingName}
            </motion.div>
            <div className="reveal-rolling-hint">靈感開壇‧神明欽點</div>
          </>
        ) : (
          <>
            <div className="reveal-rank">
              {isSpecial ? '🌟 特別獎' : `✨ 第 ${rank} / ${total} 位得獎者`}
            </div>
            <motion.div className="reveal-name"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              {winner.name}
            </motion.div>
            {winner.birthday && (
              <motion.div className="reveal-birthday"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                🎂 {winner.birthday}
              </motion.div>
            )}
            <motion.div className="reveal-divider"
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.55, duration: 0.4 }} />
            <motion.div className="reveal-divination"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
              {winner.divination}
            </motion.div>
            <motion.button className="reveal-close-btn" onClick={onClose}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              {rank < total ? `下一位 →` : '查看全部得獎者'}
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── 小型得獎卡 ─────────────────────────────────────────────
function WinnerCard({ winner, index, isGrand }) {
  return (
    <motion.div
      className={`winner-card${isGrand ? ' grand-prize' : ''}`}
      initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18, delay: index * 0.05 }}
    >
      <div className="winner-rank">{isGrand ? '🏆 大獎' : `#${index + 1}`}</div>
      <div className="winner-name">{winner.name}</div>
      {winner.birthday && <div className="winner-birthday">🎂 {winner.birthday}</div>}
      <div className="divination">{winner.divination}</div>
    </motion.div>
  );
}

// ── 主畫面 ────────────────────────────────────────────────
const ROLLING_SPEED_MS = 160;
const REVEAL_ROLL_DURATION = 1800; // ms of drum roll before showing next winner

function LotteryScreen({ participants, participants2, roundCounts, onBack }) {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [pools, setPools] = useState(null);
  const [winners, setWinners] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rollingNames, setRollingNames] = useState([]);
  const [drawDone, setDrawDone] = useState(false);
  const [revealQueue, setRevealQueue] = useState([]);
  const [revealIndex, setRevealIndex] = useState(null);
  const [isRevealRolling, setIsRevealRolling] = useState(false);
  const [revealRollingName, setRevealRollingName] = useState('');
  const rollingIntervalRef = useRef(null);
  const drawTimeoutRef = useRef(null);
  const revealRollRef = useRef(null);

  // pool2 is used for rounds 3 & 4 (all / exclude_r3 modes)
  const pool2 = participants2 || participants;

  const currentRound = ROUND_CONFIGS[currentRoundIdx];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPools({
      all: [...participants],
      current: [...participants],
      remaining: [...participants],
      all2: [...pool2],
    });
  }, [participants, pool2]);

  const getPoolForRound = useCallback((round, pools, allWinners) => {
    if (!pools) return [];
    if (round.poolMode === 'remaining') return [...pools.remaining];
    if (round.poolMode === 'exclude_r3') {
      const r3Ids = new Set((allWinners[3] || []).map(w => w.id));
      return pools.all2.filter(p => !r3Ids.has(p.id));
    }
    if (round.poolMode === 'all') return [...pools.all2];
    return [...pools.all];
  }, []);

  const currentPool = pools ? getPoolForRound(currentRound, pools, winners) : [];
  const roundWinners = winners[currentRound?.id] || [];
  const roundCount = roundCounts[currentRound?.id] || currentRound?.defaultCount || 1;
  const isGrand = currentRound?.id === 3 || currentRound?.id === 4;

  const startRolling = useCallback((poolSnapshot) => {
    const pool = (poolSnapshot && poolSnapshot.length > 0) ? poolSnapshot
      : currentPool.length > 0 ? currentPool : participants;
    const roll = () => setRollingNames(shuffleArray(pool).slice(0, 8).map(p => p.name));
    roll();
    rollingIntervalRef.current = setInterval(roll, ROLLING_SPEED_MS);
  }, [currentPool, participants]);

  const stopRolling = useCallback(() => {
    if (rollingIntervalRef.current) { clearInterval(rollingIntervalRef.current); rollingIntervalRef.current = null; }
  }, []);

  const handleDraw = () => {
    if (isDrawing || drawDone || currentPool.length === 0) return;
    setIsDrawing(true);
    const poolSnapshot = [...currentPool];
    startRolling(poolSnapshot);
    const duration = 2200 + Math.random() * 1200;
    drawTimeoutRef.current = setTimeout(() => {
      stopRolling();
      setRollingNames([]);
      const drawn = drawWinners(currentPool, roundCount, currentRound.id);
      const drawnWithDiv = drawn.map(w => ({ 
        ...w, 
        divination: buildDivinationText(w, currentRound.id) 
      }));
      setWinners(prev => ({ ...prev, [currentRound.id]: drawnWithDiv }));
      setPools(prev => {
        const ids = new Set(drawn.map(w => w.id));
        if (currentRound.poolMode === 'current') return { ...prev, current: prev.current.filter(p => !ids.has(p.id)), remaining: prev.remaining.filter(p => !ids.has(p.id)) };
        if (currentRound.poolMode === 'remaining') return { ...prev, remaining: prev.remaining.filter(p => !ids.has(p.id)) };
        return prev;
      });
      setIsDrawing(false);
      setDrawDone(true);
      setRevealQueue(drawnWithDiv);
      setRevealIndex(0);
      if (isGrand) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 6000); }
    }, duration);
  };

  const handleRevealClose = () => {
    const nextIdx = revealIndex !== null ? revealIndex + 1 : null;
    if (nextIdx !== null && nextIdx < revealQueue.length) {
      // Start drum roll before showing next winner
      setIsRevealRolling(true);
      // Use the full pool2 so the drum shows many different names while rolling
      const fullPool = (pool2 && pool2.length > 0) ? pool2 : participants;
      const allNames = fullPool.map(p => p.name);
      let rollTimer = setInterval(() => {
        const pick = allNames[Math.floor(Math.random() * allNames.length)];
        setRevealRollingName(pick || '…');
      }, ROLLING_SPEED_MS);
      revealRollRef.current = rollTimer;
      setTimeout(() => {
        clearInterval(rollTimer);
        revealRollRef.current = null;
        setIsRevealRolling(false);
        setRevealIndex(nextIdx);
      }, REVEAL_ROLL_DURATION);
    } else {
      setRevealIndex(null);
    }
  };

  const handleNextRound = () => {
    if (currentRoundIdx < ROUND_CONFIGS.length - 1) {
      setCurrentRoundIdx(i => i + 1);
      setDrawDone(false); setShowConfetti(false);
      setRevealQueue([]); setRevealIndex(null);
      setIsRevealRolling(false);
    }
  };

  const handleResetPool = () => {
    setPools(prev => ({ ...prev, current: [...participants], remaining: [...participants], all2: [...pool2] }));
    setWinners(prev => ({ ...prev, [currentRound.id]: [] }));
    setDrawDone(false); setRevealQueue([]); setRevealIndex(null);
    setIsRevealRolling(false);
  };

  useEffect(() => () => {
    stopRolling();
    if (drawTimeoutRef.current) clearTimeout(drawTimeoutRef.current);
    if (revealRollRef.current) clearInterval(revealRollRef.current);
  }, [stopRolling]);

  if (!pools || !currentRound) return null;
  const currentRevealWinner = (revealIndex !== null && !isRevealRolling) ? revealQueue[revealIndex] : null;

  return (
    <div className={`lottery-screen${drawDone ? ' lottery-screen--done' : ''}`}>
      <div className={`round-bg round-bg--${currentRound.id}`} style={{ backgroundImage: `url('${currentRound.bgImage}')` }} />
      {isGrand && <div className="divine-light" />}
      {showConfetti && <Confetti count={120} />}
      <button className="back-btn" onClick={onBack}>← 返回設定</button>
      <div className="round-progress">
        {ROUND_CONFIGS.map((r, i) => (
          <div key={r.id} className={`progress-dot ${i === currentRoundIdx ? 'active' : i < currentRoundIdx ? 'completed' : ''}`} title={r.shortName} />
        ))}
      </div>

      {/* Fixed drum zone - only shown when not done */}
      <AnimatePresence>
        {!drawDone && (
          <motion.div className="drum-zone"
            initial={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.5 }}>
            <motion.div className="round-header" key={`hdr-${currentRound.id}`}
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="round-title">{currentRound.emoji} {currentRound.name}</h2>
              <div className="round-info-bar">
                <span className="info-chip">名單 {currentPool.length} 人</span>
                <span className="info-chip">抽出 {roundCount} 人</span>
                {currentRound.poolMode === 'exclude_r3' && <span className="info-chip">已扣除第三輪得獎者</span>}
                {currentRound.poolMode === 'all' && <span className="info-chip">全員重置</span>}
              </div>
            </motion.div>

            <div className="drum-section">
              <motion.div className="drum-container"
                animate={isDrawing ? { rotate: [-2, 2, -2, 2, -1, 1, 0] } : {}}
                transition={isDrawing ? { duration: 0.5, repeat: Infinity } : {}}>
                <div className="drum-body">
                  <span className="drum-symbol" style={{ position: 'absolute', top: '15%' }}>{currentRound.emoji}</span>
                  <div className="drum-window">
                    {isDrawing && rollingNames.length > 0
                      ? <div className="rolling-names">{rollingNames.map((n, i) => <span key={i}>{n}</span>)}</div>
                      : <div className="idle-text">按下開始抽獎</div>
                    }
                  </div>
                </div>
                <div className="drum-stand" />
              </motion.div>

              <motion.button className={`draw-btn${isDrawing ? ' drawing' : ''}`} onClick={handleDraw}
                disabled={isDrawing || currentPool.length === 0}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.97 }}>
                {isDrawing ? '神明降壇中…' : currentPool.length === 0 ? '名單已空' : `開始抽獎（抽 ${roundCount} 人）`}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winners zone - shown after draw */}
      <AnimatePresence>
        {drawDone && (
          <motion.div className="winners-zone"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Compact round title when done */}
            <div className="done-header">
              <div className="round-badge">{currentRound.emoji} {currentRound.name}</div>
              <div className="done-title">得獎名單</div>
            </div>

            <div className="winners-area">
              {roundWinners.length > 0 && (
                <>
                  <div className="winners-grid">
                    {roundWinners.map((w, idx) => (
                      <WinnerCard key={w.id} winner={w} index={idx} isGrand={isGrand && roundWinners.length === 1} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Action buttons at bottom */}
            <div className="done-actions">
              <AnimatePresence>
                {revealIndex === null && revealQueue.length > 0 && (
                  <motion.button className="reveal-again-btn" onClick={() => setRevealIndex(0)}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    重新逐一揭曉
                  </motion.button>
                )}
              </AnimatePresence>
              {currentRoundIdx < ROUND_CONFIGS.length - 1
                ? <button className="next-round-btn" onClick={handleNextRound}>前往 {ROUND_CONFIGS[currentRoundIdx + 1].shortName} →</button>
                : <div className="all-done-msg">🎉 所有輪次已完成！感謝媽祖庇佑！</div>
              }
              {['all','exclude_r3','remaining'].includes(currentRound.poolMode) && (
                <button className="reset-btn" onClick={handleResetPool}>重置並重抽</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(currentRevealWinner || isRevealRolling) && (
          <WinnerRevealOverlay
            key={`reveal-${revealIndex}-${isRevealRolling ? 'roll' : 'show'}`}
            winner={currentRevealWinner || {}}
            roundId={currentRound.id}
            rank={revealIndex !== null ? revealIndex + 1 : 1}
            total={revealQueue.length}
            onClose={!isRevealRolling ? handleRevealClose : undefined}
            isRolling={isRevealRolling}
            rollingName={revealRollingName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default LotteryScreen;

