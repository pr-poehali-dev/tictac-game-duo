import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

type Player = 'star' | 'moon';
type CellValue = Player | null;
type Board = CellValue[];

interface GameStats {
  star: number;
  moon: number;
  draws: number;
}

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerStarName, setPlayerStarName] = useState(() => {
    return localStorage.getItem('player1Name') || 'Игрок 1';
  });
  const [playerMoonName, setPlayerMoonName] = useState(() => {
    return localStorage.getItem('player2Name') || 'Игрок 2';
  });
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('star');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('gameStats');
    return saved ? JSON.parse(saved) : { star: 0, moon: 0, draws: 0 };
  });
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [player1Emoji, setPlayer1Emoji] = useState(() => {
    return localStorage.getItem('player1Emoji') || '⭐';
  });
  const [player2Emoji, setPlayer2Emoji] = useState(() => {
    return localStorage.getItem('player2Emoji') || '🌙';
  });

  const emojiOptions = ['⭐', '🌙', '🔥', '💎', '🎯', '⚡', '🌈', '🦄', '🐉', '👑', '🎮', '🚀', '💫', '🌟', '✨', '🎨', '🎭', '🎪', '🎲', '🏆'];

  useEffect(() => {
    localStorage.setItem('player1Name', playerStarName);
  }, [playerStarName]);

  useEffect(() => {
    localStorage.setItem('player2Name', playerMoonName);
  }, [playerMoonName]);

  useEffect(() => {
    localStorage.setItem('player1Emoji', player1Emoji);
  }, [player1Emoji]);

  useEffect(() => {
    localStorage.setItem('player2Emoji', player2Emoji);
  }, [player2Emoji]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('gameStats', JSON.stringify(stats));
  }, [stats]);

  const playSound = (type: 'move' | 'win' | 'draw') => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'move') {
      oscillator.frequency.setValueAtTime(520, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(720, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'win') {
      const frequencies = [523.25, 659.25, 783.99];
      frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
      });
    } else if (type === 'draw') {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (currentBoard: Board): Player | 'draw' | null => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        setWinningLine(combination);
        return currentBoard[a];
      }
    }
    
    if (currentBoard.every(cell => cell !== null)) {
      return 'draw';
    }
    
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    playSound('move');

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setTimeout(() => {
        playSound(gameWinner === 'draw' ? 'draw' : 'win');
      }, 200);
      
      setWinner(gameWinner);
      setShowWinnerDialog(true);
      
      setStats(prev => ({
        ...prev,
        star: gameWinner === 'star' ? prev.star + 1 : prev.star,
        moon: gameWinner === 'moon' ? prev.moon + 1 : prev.moon,
        draws: gameWinner === 'draw' ? prev.draws + 1 : prev.draws
      }));
    } else {
      setCurrentPlayer(currentPlayer === 'star' ? 'moon' : 'star');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('star');
    setWinner(null);
    setWinningLine([]);
    setShowWinnerDialog(false);
  };

  const startNewGame = () => {
    if (!playerStarName.trim() || !playerMoonName.trim()) return;
    setGameStarted(true);
    resetGame();
  };

  const changeNames = () => {
    setGameStarted(false);
    resetGame();
  };

  const getPlayerSymbol = (player: Player) => player === 'star' ? player1Emoji : player2Emoji;
  const getCurrentPlayerName = () => currentPlayer === 'star' ? playerStarName : playerMoonName;

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-background via-background to-purple-950/20">
        <Card className="w-full max-w-lg animate-fade-in border-2 border-primary/20 bg-card/95 backdrop-blur">
          <CardHeader className="text-center space-y-4 sm:space-y-6">
            <div className="text-7xl sm:text-8xl mb-4 animate-bounce-in">{player1Emoji}{player2Emoji}</div>
            <CardTitle className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Крестики-нолики
            </CardTitle>
            <CardDescription className="text-xl sm:text-2xl">Выберите эмодзи и введите имена</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <label className="text-lg sm:text-xl font-semibold flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{player1Emoji}</span> Игрок 1
              </label>
              <Input
                value={playerStarName}
                onChange={(e) => setPlayerStarName(e.target.value)}
                placeholder="Имя первого игрока"
                className="text-xl sm:text-2xl h-14 sm:h-16 border-primary/30 focus:border-primary"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setPlayer1Emoji(emoji)}
                    className={`text-3xl sm:text-4xl p-2 rounded-lg transition-all hover:scale-110 ${
                      player1Emoji === emoji ? 'bg-primary/30 ring-2 ring-primary' : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-lg sm:text-xl font-semibold flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{player2Emoji}</span> Игрок 2
              </label>
              <Input
                value={playerMoonName}
                onChange={(e) => setPlayerMoonName(e.target.value)}
                placeholder="Имя второго игрока"
                className="text-xl sm:text-2xl h-14 sm:h-16 border-secondary/30 focus:border-secondary"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setPlayer2Emoji(emoji)}
                    className={`text-3xl sm:text-4xl p-2 rounded-lg transition-all hover:scale-110 ${
                      player2Emoji === emoji ? 'bg-secondary/30 ring-2 ring-secondary' : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <Button 
              onClick={startNewGame} 
              className="w-full text-xl sm:text-2xl h-16 sm:h-20 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all"
              disabled={!playerStarName.trim() || !playerMoonName.trim()}
            >
              Начать игру
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 bg-gradient-to-br from-background via-background to-purple-950/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Крестики-нолики
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">{player1Emoji} {playerStarName} vs {playerMoonName} {player2Emoji}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                    <span className="text-5xl sm:text-6xl animate-bounce-in">
                      {getPlayerSymbol(currentPlayer)}
                    </span>
                    <span>Ход: {getCurrentPlayerName()}</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setSoundEnabled(!soundEnabled)} 
                      variant="outline" 
                      size="sm" 
                      className="text-base sm:text-sm h-10 sm:h-9"
                    >
                      <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={18} />
                    </Button>
                    <Button onClick={changeNames} variant="outline" size="sm" className="text-base sm:text-sm h-10 sm:h-9">
                      <Icon name="Settings" className="mr-2" size={18} />
                      Сменить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={!!cell || !!winner}
                      className={`
                        aspect-square rounded-xl sm:rounded-2xl text-6xl sm:text-7xl font-bold
                        transition-all duration-200
                        ${cell ? 'bg-gradient-to-br from-primary/20 to-secondary/20' : 'bg-muted hover:bg-muted/70'}
                        ${!cell && !winner ? 'hover:scale-105 cursor-pointer active:scale-95' : ''}
                        ${winningLine.includes(index) ? 'animate-winner-celebration bg-gradient-to-br from-primary to-secondary' : ''}
                        ${cell ? 'animate-bounce-in' : ''}
                        border-2 border-border
                      `}
                    >
                      {cell && getPlayerSymbol(cell)}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3 justify-center mt-6">
                  <Button onClick={resetGame} variant="outline" className="gap-2 h-12 sm:h-10 text-lg sm:text-base px-6">
                    <Icon name="RotateCcw" size={20} />
                    Новая игра
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Icon name="Trophy" size={28} className="text-accent" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-4 sm:p-3 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-2xl">{player1Emoji}</span>
                    <span className="font-semibold text-lg sm:text-base">{playerStarName}</span>
                  </div>
                  <Badge className="text-xl sm:text-lg px-4 py-1.5 sm:px-3 sm:py-1 bg-primary">{stats.star}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 sm:p-3 bg-gradient-to-r from-secondary/20 to-secondary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-2xl">{player2Emoji}</span>
                    <span className="font-semibold text-lg sm:text-base">{playerMoonName}</span>
                  </div>
                  <Badge className="text-xl sm:text-lg px-4 py-1.5 sm:px-3 sm:py-1 bg-secondary">{stats.moon}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 sm:p-3 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="Handshake" size={24} />
                    <span className="font-semibold text-lg sm:text-base">Ничья</span>
                  </div>
                  <Badge variant="outline" className="text-xl sm:text-lg px-4 py-1.5 sm:px-3 sm:py-1">{stats.draws}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Icon name="BookOpen" size={28} className="text-accent" />
                  Правила игры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-base sm:text-sm">
                <div className="flex gap-3">
                  <Badge className="bg-primary shrink-0 h-7 w-7 flex items-center justify-center text-base sm:text-sm">1</Badge>
                  <p>Игроки ходят по очереди, ставя свой символ ({player1Emoji} или {player2Emoji}) в пустую клетку</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-secondary shrink-0 h-7 w-7 flex items-center justify-center text-base sm:text-sm">2</Badge>
                  <p>Побеждает тот, кто первым выстроит 3 своих символа в ряд по горизонтали, вертикали или диагонали</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-accent shrink-0 h-7 w-7 flex items-center justify-center text-base sm:text-sm">3</Badge>
                  <p>Если все клетки заполнены и никто не выиграл — объявляется ничья</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="sm:max-w-md border-2 border-primary/30 bg-gradient-to-br from-card to-primary/10 w-[90vw] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl sm:text-4xl">
              {winner === 'draw' ? (
                <div className="space-y-6">
                  <div className="text-8xl sm:text-9xl animate-bounce-in">🤝</div>
                  <div className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-4xl sm:text-3xl">
                    Ничья!
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-9xl sm:text-8xl animate-winner-celebration">
                    {winner && getPlayerSymbol(winner)}
                  </div>
                  <div className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent text-3xl sm:text-3xl">
                    {winner === 'star' ? playerStarName : playerMoonName} победил!
                  </div>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button onClick={resetGame} className="flex-1 bg-gradient-to-r from-primary to-secondary h-14 sm:h-10 text-lg sm:text-base">
              <Icon name="RotateCcw" className="mr-2" size={22} />
              Новая игра
            </Button>
            <Button onClick={() => setShowWinnerDialog(false)} variant="outline" className="flex-1 h-14 sm:h-10 text-lg sm:text-base">
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;