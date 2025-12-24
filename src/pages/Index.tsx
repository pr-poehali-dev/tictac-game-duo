import { useState } from 'react';
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
  const [playerStarName, setPlayerStarName] = useState('Игрок 1');
  const [playerMoonName, setPlayerMoonName] = useState('Игрок 2');
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('star');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>({ star: 0, moon: 0, draws: 0 });
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);

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

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
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

  const getPlayerSymbol = (player: Player) => player === 'star' ? '⭐' : '🌙';
  const getCurrentPlayerName = () => currentPlayer === 'star' ? playerStarName : playerMoonName;

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-purple-950/20">
        <Card className="w-full max-w-md animate-fade-in border-2 border-primary/20 bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4 animate-bounce-in">⭐🌙</div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Крестики-нолики
            </CardTitle>
            <CardDescription className="text-lg">Введите имена игроков</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <span className="text-2xl">⭐</span> Игрок 1
              </label>
              <Input
                value={playerStarName}
                onChange={(e) => setPlayerStarName(e.target.value)}
                placeholder="Имя первого игрока"
                className="text-lg border-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <span className="text-2xl">🌙</span> Игрок 2
              </label>
              <Input
                value={playerMoonName}
                onChange={(e) => setPlayerMoonName(e.target.value)}
                placeholder="Имя второго игрока"
                className="text-lg border-secondary/30 focus:border-secondary"
              />
            </div>
            <Button 
              onClick={startNewGame} 
              className="w-full text-lg h-12 bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all"
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
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-purple-950/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Крестики-нолики
          </h1>
          <p className="text-muted-foreground">⭐ {playerStarName} vs {playerMoonName} 🌙</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-4xl animate-bounce-in">
                      {getPlayerSymbol(currentPlayer)}
                    </span>
                    <span>Ход: {getCurrentPlayerName()}</span>
                  </CardTitle>
                  <Button onClick={changeNames} variant="outline" size="sm">
                    <Icon name="Settings" className="mr-2" size={16} />
                    Сменить игроков
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={!!cell || !!winner}
                      className={`
                        aspect-square rounded-2xl text-6xl font-bold
                        transition-all duration-200
                        ${cell ? 'bg-gradient-to-br from-primary/20 to-secondary/20' : 'bg-muted hover:bg-muted/70'}
                        ${!cell && !winner ? 'hover:scale-105 cursor-pointer' : ''}
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
                  <Button onClick={resetGame} variant="outline" className="gap-2">
                    <Icon name="RotateCcw" size={18} />
                    Новая игра
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Trophy" size={24} className="text-accent" />
                  Статистика
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/20 to-primary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="font-semibold">{playerStarName}</span>
                  </div>
                  <Badge className="text-lg px-3 py-1 bg-primary">{stats.star}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-secondary/20 to-secondary/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌙</span>
                    <span className="font-semibold">{playerMoonName}</span>
                  </div>
                  <Badge className="text-lg px-3 py-1 bg-secondary">{stats.moon}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon name="Handshake" size={20} />
                    <span className="font-semibold">Ничья</span>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">{stats.draws}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 bg-card/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" size={24} className="text-accent" />
                  Правила игры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Badge className="bg-primary shrink-0">1</Badge>
                  <p>Игроки ходят по очереди, ставя свой символ (⭐ или 🌙) в пустую клетку</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-secondary shrink-0">2</Badge>
                  <p>Побеждает тот, кто первым выстроит 3 своих символа в ряд по горизонтали, вертикали или диагонали</p>
                </div>
                <div className="flex gap-3">
                  <Badge className="bg-accent shrink-0">3</Badge>
                  <p>Если все клетки заполнены и никто не выиграл — объявляется ничья</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="sm:max-w-md border-2 border-primary/30 bg-gradient-to-br from-card to-primary/10">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              {winner === 'draw' ? (
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce-in">🤝</div>
                  <div className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Ничья!
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-7xl animate-winner-celebration">
                    {winner && getPlayerSymbol(winner)}
                  </div>
                  <div className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {winner === 'star' ? playerStarName : playerMoonName} победил!
                  </div>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button onClick={resetGame} className="flex-1 bg-gradient-to-r from-primary to-secondary">
              <Icon name="RotateCcw" className="mr-2" size={18} />
              Новая игра
            </Button>
            <Button onClick={() => setShowWinnerDialog(false)} variant="outline" className="flex-1">
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
