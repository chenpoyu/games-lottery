import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { parseParticipants, ROUND_CONFIGS } from '../data/lotteryData';

// Parse CSV content into the same name,birthday format the app expects
function parseCsvToText(csvContent) {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '';

  // Detect if first row is a header (contains non-date text in second column)
  let startIdx = 0;
  const firstCols = lines[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
  const looksLikeHeader = firstCols.length >= 1 && /[a-zA-Z姓名日期生日編號封號]/i.test(firstCols[0]) && !firstCols[1]?.match(/^\d{4}/);
  if (looksLikeHeader) startIdx = 1;

  return lines.slice(startIdx).map(line => {
    // Strip quotes, split by comma
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const name = cols[0] || '';
    // Try to find a date-like column
    const dateCol = cols.slice(1).find(c => /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(c));
    const birthday = dateCol ? dateCol.replace(/\//g, '-') : '';
    return birthday ? `${name},${birthday}` : name;
  }).filter(Boolean).join('\n');
}

function SetupScreen({ onStart }) {
  const fileRef1 = useRef(null);
  const fileRef2 = useRef(null);
  const DEFAULT_PARTICIPANTS = ``;
  const DEFAULT_PARTICIPANTS2 = ``;

  const [rawText, setRawText] = useState(DEFAULT_PARTICIPANTS);
  const [rawText2, setRawText2] = useState(DEFAULT_PARTICIPANTS2);
  const [participants, setParticipants] = useState([]);
  const [participants2, setParticipants2] = useState([]);
  const [roundCounts, setRoundCounts] = useState(
    ROUND_CONFIGS.reduce((acc, r) => ({ ...acc, [r.id]: r.defaultCount }), {})
  );

  useEffect(() => {
    setParticipants(parseParticipants(rawText));
  }, [rawText]);

  useEffect(() => {
    setParticipants2(parseParticipants(rawText2));
  }, [rawText2]);

  const handleCsvImport = (setter) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      let text = ev.target.result;
      // Strip BOM if present
      if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
      setter(parseCsvToText(text));
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = ''; // allow re-importing same file
  };

  const handleStart = () => {
    if (participants.length === 0) return;
    onStart({ participants, participants2: participants2.length > 0 ? participants2 : participants, roundCounts });
  };

  const canStart = participants.length > 0;

  const EXAMPLE_TEXT = `王大明,1990-05-20
李小花,1985-12-03
張志豪,1992-08-15`;

  return (
    <div className="setup-screen">
      {/* Participants Input */}
      <motion.div
        className="section-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2><span className="icon">📋</span>輸入參加者名單</h2>
        <div className="import-row">
          <input type="file" accept=".csv,.txt" ref={fileRef1} onChange={handleCsvImport(setRawText)} style={{ display: 'none' }} />
          <button className="import-btn" onClick={() => fileRef1.current.click()}>📂 匯入 CSV 檔</button>
          <span className="import-hint">支援 Excel 另存的 .csv 格式</span>
        </div>
        <textarea
          className="participants-textarea"
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={`範例格式（每行一人）：\n${EXAMPLE_TEXT}\n\n也可輸入純姓名（無生日）`}
          spellCheck={false}
        />
        <p className="input-hint">
          📌 格式：<strong>姓名,生日(YYYY-MM-DD)</strong>，以換行分隔每一位參加者。<br />
          生日為選填，若無生日可僅輸入姓名。
        </p>
        {participants.length > 0 && (
          <div className="parsed-count">
            <span>✅</span>
            <span>已解析 <strong>{participants.length}</strong> 位參加者</span>
          </div>
        )}
      </motion.div>

      {/* Round 3 & 4 Participants */}
      <motion.div
        className="section-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        <h2><span className="icon">🏆</span>第三、四輪名單（終極大獎）</h2>
        <div className="import-row">
          <input type="file" accept=".csv,.txt" ref={fileRef2} onChange={handleCsvImport(setRawText2)} style={{ display: 'none' }} />
          <button className="import-btn" onClick={() => fileRef2.current.click()}>📂 匯入 CSV 檔</button>
          <span className="import-hint">支援 Excel 另存的 .csv 格式</span>
        </div>
        <textarea
          className="participants-textarea"
          value={rawText2}
          onChange={e => setRawText2(e.target.value)}
          placeholder={`第三輪與第四輪使用此名單\n格式同上：姓名,生日(YYYY-MM-DD)`}
          spellCheck={false}
        />
        <p className="input-hint">
          📌 第三輪（終極大獎）與第四輪（特別獎）將從此名單中抽出。<br />
          若留空，將沿用上方第一二輪名單。
        </p>
        {participants2.length > 0 && (
          <div className="parsed-count">
            <span>✅</span>
            <span>已解析 <strong>{participants2.length}</strong> 位參加者</span>
          </div>
        )}
      </motion.div>
      <motion.div
        className="section-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2><span className="icon">⚙️</span>各輪抽獎設定</h2>
        <div className="rounds-config">
          {ROUND_CONFIGS.map((round) => (
            <div key={round.id} className="round-config-item">
              <div className="round-info">
                <div className="round-badge">
                  <span className="round-num">{round.shortName}</span>
                  <span className="round-name">{round.emoji} {round.name}</span>
                </div>
                <p className="round-desc">{round.description}</p>
                {/* {round.poolMode === 'current' && (
                  <p className="round-desc" style={{ color: 'rgba(255,180,0,0.6)', marginTop: 4 }}>
                    🎯 名單來源：全體參加者
                  </p>
                )}
                {round.poolMode === 'remaining' && (
                  <p className="round-desc" style={{ color: 'rgba(255,180,0,0.6)', marginTop: 4 }}>
                    🎯 名單來源：第一輪未中獎者
                  </p>
                )}
                {round.poolMode === 'all' && (
                  <p className="round-desc" style={{ color: 'rgba(255,180,0,0.6)', marginTop: 4 }}>
                    🎯 名單來源：全體參加者（重置）
                  </p>
                )} */}
              </div>
              <div className="round-count-input">
                <label>抽出人數</label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={roundCounts[round.id]}
                  onChange={e => setRoundCounts(prev => ({
                    ...prev,
                    [round.id]: Math.max(1, parseInt(e.target.value) || 1)
                  }))}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Game Rules */}
      <motion.div
        className="section-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2><span className="icon">📜</span>遊戲規則說明</h2>
        <div className="game-rules">
          <ul className="rules-list">
            <li>
              <span className="rule-icon">🔥</span>
              <span>
                <strong>第一輪｜離火微光・小福氣獎</strong>：從全體名單中隨機抽出指定人數，
                中獎者將自動從後續名單中移除。
              </span>
            </li>
            <li>
              <span className="rule-icon">🙏</span>
              <span>
                <strong>第二輪｜神光普照・媽祖保佑獎</strong>：從第一輪未中獎的剩餘名單中抽出，
                中獎者同樣自動移除。
              </span>
            </li>
            <li>
              <span className="rule-icon">🏆</span>
              <span>
                <strong>第三輪｜天命歸一・終極大獎</strong>：全體名單重置回全員參加，
                抽出終極大獎得主。
              </span>
            </li>
            <li>
              <span className="rule-icon">🌟</span>
              <span>
                <strong>第四輪｜水火既濟・特別獎</strong>：扣除第三輪大獎得主，
                從全體名單中再抽出特別獎得主，媽祖另賜殊榮。
              </span>
            </li>
            <li>
              <span className="rule-icon">✨</span>
              <span>
                每位中獎者皆會獲得專屬的<strong>「離火運命理鑑定語」</strong>，
                由丙午馬年天命隨機降臨！
              </span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.button
        className="start-btn"
        onClick={handleStart}
        disabled={!canStart}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        whileTap={{ scale: 0.97 }}
      >
        {canStart ? '🏮 開壇起乩，啟動抽獎！🏮' : '請先輸入參加者名單'}
      </motion.button>
    </div>
  );
}

export default SetupScreen;
