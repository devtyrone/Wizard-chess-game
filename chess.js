// Advanced Chess Game Implementation
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
        this.aiDifficulty = 'medium';
        this.gameSettings = {
            soundEffects: true,
            showCoordinates: true,
            highlightMoves: true,
            aiDifficulty: 'medium'
        };
        
        this.initializeGame();
    }

    initializeBoard() {
        const initialBoard = [
            ['brook', 'bknight', 'bbishop', 'bqueen', 'bking', 'bbishop', 'bknight', 'brook'],
            ['bpawn', 'bpawn', 'bpawn', 'bpawn', 'bpawn', 'bpawn', 'bpawn', 'bpawn'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['wpawn', 'wpawn', 'wpawn', 'wpawn', 'wpawn', 'wpawn', 'wpawn', 'wpawn'],
            ['wrook', 'wknight', 'wbishop', 'wqueen', 'wking', 'wbishop', 'wknight', 'wrook']
        ];
        return initialBoard;
    }

    initializeGame() {
        this.createBoard();
        this.renderBoard();
        this.setupEventListeners();
        this.updateTurnDisplay();
        this.updateGameModeDisplay();
    }

    createBoard() {
        const boardElement = document.getElementById('chess-board');
        boardElement.innerHTML = '';
        
        // Add coordinates
        const filesCoords = document.createElement('div');
        filesCoords.className = 'coordinates files';
        filesCoords.innerHTML = '<span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span>';
        
        const ranksCoords = document.createElement('div');
        ranksCoords.className = 'coordinates ranks';
        ranksCoords.innerHTML = '<span>8</span><span>7</span><span>6</span><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>';
        
        boardElement.appendChild(filesCoords);
        boardElement.appendChild(ranksCoords);

        // Create squares
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }

    renderBoard() {
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const piece = this.board[row][col];
            
            // Clear square
            square.innerHTML = '';
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            
            // Add piece if exists
            if (piece) {
                const img = document.createElement('img');
                const color = piece.charAt(0).toUpperCase();
                const pieceType = piece.slice(1);
                img.src = `assets/images/${color}${pieceType}.png`;
                img.alt = piece;
                img.className = 'piece';
                img.onerror = () => {
                    console.error(`Failed to load image: ${img.src}`);
                    square.textContent = piece;
                };
                square.appendChild(img);
            }
        });
    }

    handleSquareClick(row, col) {
        // Prevent moves when AI is thinking
        if (this.gameMode === 'ai' && this.currentPlayer === 'black') {
            return;
        }

        const piece = this.board[row][col];
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        // If no piece is selected
        if (!this.selectedSquare) {
            if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
                this.selectSquare(row, col);
                this.highlightPossibleMoves(row, col);
            }
        } else {
            // If clicking on the same square, deselect
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                this.deselectSquare();
            } 
            // If clicking on another piece of the same color, select it instead
            else if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
                this.deselectSquare();
                this.selectSquare(row, col);
                this.highlightPossibleMoves(row, col);
            }
            // Try to make a move
            else if (this.isValidMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
                this.deselectSquare();
                this.switchPlayer();
                this.updateTurnDisplay();
                
                // Check for game end
                if (!this.checkGameEnd()) {
                    // If in AI mode and it's black's turn, make AI move
                    if (this.gameMode === 'ai' && this.currentPlayer === 'black') {
                        setTimeout(() => this.makeAIMove(), 500);
                    }
                }
            } else {
                this.deselectSquare();
            }
        }
    }

    selectSquare(row, col) {
        this.selectedSquare = { row, col };
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('selected');
    }

    deselectSquare() {
        if (this.selectedSquare) {
            const square = document.querySelector(`[data-row="${this.selectedSquare.row}"][data-col="${this.selectedSquare.col}"]`);
            square.classList.remove('selected');
        }
        this.selectedSquare = null;
        this.clearHighlights();
    }

    highlightPossibleMoves(row, col) {
        const moves = this.getPossibleMoves(row, col);
        moves.forEach(move => {
            const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
            if (this.board[move.row][move.col]) {
                square.classList.add('capture-move');
            } else {
                square.classList.add('possible-move');
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.possible-move, .capture-move').forEach(square => {
            square.classList.remove('possible-move', 'capture-move');
        });
    }

    isPieceOwnedByCurrentPlayer(piece) {
        return piece && piece.charAt(0) === this.currentPlayer.charAt(0);
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const pieceType = piece.slice(1);
        const color = piece.charAt(0);

        switch (pieceType) {
            case 'pawn': return this.getPawnMoves(row, col, color);
            case 'rook': return this.getRookMoves(row, col);
            case 'knight': return this.getKnightMoves(row, col);
            case 'bishop': return this.getBishopMoves(row, col);
            case 'queen': return this.getQueenMoves(row, col);
            case 'king': return this.getKingMoves(row, col);
            default: return [];
        }
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // Forward move
        if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Captures
        [-1, 1].forEach(colOffset => {
            const newRow = row + direction;
            const newCol = col + colOffset;
            if (this.isValidPosition(newRow, newCol) && 
                this.board[newRow][newCol] && 
                !this.isPieceOwnedByCurrentPlayer(this.board[newRow][newCol])) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    getRookMoves(row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([dRow, dCol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;

                if (!this.isValidPosition(newRow, newCol)) break;

                if (!this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (!this.isPieceOwnedByCurrentPlayer(this.board[newRow][newCol])) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol) &&
                (!this.board[newRow][newCol] || !this.isPieceOwnedByCurrentPlayer(this.board[newRow][newCol]))) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        directions.forEach(([dRow, dCol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;

                if (!this.isValidPosition(newRow, newCol)) break;

                if (!this.board[newRow][newCol]) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (!this.isPieceOwnedByCurrentPlayer(this.board[newRow][newCol])) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol) &&
                (!this.board[newRow][newCol] || !this.isPieceOwnedByCurrentPlayer(this.board[newRow][newCol]))) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const possibleMoves = this.getPossibleMoves(fromRow, fromCol);
        return possibleMoves.some(move => move.row === toRow && move.col === toCol);
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        // Handle captured piece
        if (capturedPiece) {
            const capturedColor = capturedPiece.charAt(0) === 'w' ? 'white' : 'black';
            this.capturedPieces[capturedColor].push(capturedPiece);
            this.updateCapturedPieces();
        }

        // Move piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle pawn promotion
        if (piece.includes('pawn')) {
            if ((piece.charAt(0) === 'w' && toRow === 0) || (piece.charAt(0) === 'b' && toRow === 7)) {
                this.board[toRow][toCol] = piece.charAt(0) + 'queen';
            }
        }

        // Add to move history
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece
        });

        this.updateMoveHistory();
        this.renderBoard();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    updateTurnDisplay() {
        const turnElement = document.getElementById('current-turn');
        if (this.gameMode === 'ai') {
            if (this.currentPlayer === 'white') {
                turnElement.textContent = "Your Turn";
            } else {
                turnElement.textContent = "AI Thinking...";
            }
        } else {
            turnElement.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s Turn`;
        }
    }

    updateGameModeDisplay() {
        const gameModeElement = document.getElementById('game-mode');
        gameModeElement.textContent = this.gameMode === 'ai' ? 'Player vs AI' : 'Player vs Player';
    }

    makeAIMove() {
        const allMoves = this.getAllPossibleMoves('black');
        if (allMoves.length === 0) return;

        let bestMove;
        switch (this.aiDifficulty) {
            case 'easy':
                bestMove = this.getRandomMove(allMoves);
                break;
            case 'medium':
                bestMove = this.getMediumMove(allMoves);
                break;
            case 'hard':
                bestMove = this.getBestMove(allMoves);
                break;
            default:
                bestMove = this.getRandomMove(allMoves);
        }

        if (bestMove) {
            this.makeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
            this.switchPlayer();
            this.updateTurnDisplay();
            this.checkGameEnd();
        }
    }

    getAllPossibleMoves(color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.charAt(0) === color.charAt(0)) {
                    const possibleMoves = this.getPossibleMoves(row, col);
                    possibleMoves.forEach(move => {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col,
                            piece: piece,
                            capturedPiece: this.board[move.row][move.col]
                        });
                    });
                }
            }
        }
        return moves;
    }

    getRandomMove(moves) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    getMediumMove(moves) {
        // Prioritize captures, then random
        const captureMoves = moves.filter(move => move.capturedPiece);
        if (captureMoves.length > 0) {
            return this.getRandomMove(captureMoves);
        }
        return this.getRandomMove(moves);
    }

    getBestMove(moves) {
        // Simple evaluation: prioritize captures by piece value
        const pieceValues = {
            'pawn': 1, 'knight': 3, 'bishop': 3, 
            'rook': 5, 'queen': 9, 'king': 100
        };

        let bestMove = moves[0];
        let bestScore = -1000;

        moves.forEach(move => {
            let score = 0;
            
            // Reward captures
            if (move.capturedPiece) {
                const capturedType = move.capturedPiece.slice(1);
                score += pieceValues[capturedType] || 0;
            }

            // Prefer center control
            const centerDistance = Math.abs(move.toRow - 3.5) + Math.abs(move.toCol - 3.5);
            score += (7 - centerDistance) * 0.1;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        return bestMove;
    }

    showHint() {
        // Clear any existing hints
        this.clearHints();
        
        // Get all possible moves for current player
        const allMoves = this.getAllPossibleMoves(this.currentPlayer);
        
        if (allMoves.length === 0) {
            this.showGameStatus('No moves available!', 'warning');
            return;
        }

        // Get the best move using AI logic
        const hintMove = this.getBestMove(allMoves);
        
        if (hintMove) {
            // Highlight the suggested move
            this.highlightHint(hintMove);
            
            // Show hint message
            const fromSquare = String.fromCharCode(97 + hintMove.fromCol) + (8 - hintMove.fromRow);
            const toSquare = String.fromCharCode(97 + hintMove.toCol) + (8 - hintMove.toRow);
            const pieceType = hintMove.piece.slice(1);
            
            let hintMessage = `Hint: Move ${pieceType} from ${fromSquare} to ${toSquare}`;
            
            if (hintMove.capturedPiece) {
                const capturedType = hintMove.capturedPiece.slice(1);
                hintMessage += ` (captures ${capturedType})`;
            }
            
            this.showGameStatus(hintMessage, 'info');
            
            // Clear hint after 5 seconds
            setTimeout(() => {
                this.clearHints();
                this.hideGameStatus();
            }, 5000);
        }
    }

    highlightHint(move) {
        // Highlight source square
        const fromSquare = document.querySelector(`[data-row="${move.fromRow}"][data-col="${move.fromCol}"]`);
        if (fromSquare) {
            fromSquare.classList.add('hint-from');
        }
        
        // Highlight destination square
        const toSquare = document.querySelector(`[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
        if (toSquare) {
            if (move.capturedPiece) {
                toSquare.classList.add('hint-capture');
            } else {
                toSquare.classList.add('hint-to');
            }
        }
    }

    clearHints() {
        document.querySelectorAll('.hint-from, .hint-to, .hint-capture').forEach(square => {
            square.classList.remove('hint-from', 'hint-to', 'hint-capture');
        });
    }

    updateCapturedPieces() {
        ['white', 'black'].forEach(color => {
            const container = document.getElementById(`captured-${color}-pieces`);
            container.innerHTML = '';
            this.capturedPieces[color].forEach(piece => {
                const img = document.createElement('img');
                const pieceColor = piece.charAt(0).toUpperCase();
                const pieceType = piece.slice(1);
                img.src = `assets/images/${pieceColor}${pieceType}.png`;
                img.className = 'captured-piece';
                img.alt = piece;
                container.appendChild(img);
            });
        });
    }

    updateMoveHistory() {
        const moveList = document.getElementById('move-list');
        moveList.innerHTML = '';
        this.moveHistory.forEach((move, index) => {
            const moveItem = document.createElement('div');
            moveItem.className = 'move-item';
            const from = String.fromCharCode(97 + move.from.col) + (8 - move.from.row);
            const to = String.fromCharCode(97 + move.to.col) + (8 - move.to.row);
            moveItem.textContent = `${index + 1}. ${from}-${to}`;
            moveList.appendChild(moveItem);
        });
    }


    checkGameEnd() {
        // Simple checkmate detection (can be enhanced)
        const hasValidMoves = this.hasValidMoves();
        if (!hasValidMoves) {
            this.endGame(`${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
            return true;
        }
        return false;
    }

    hasValidMoves() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.isPieceOwnedByCurrentPlayer(piece)) {
                    const moves = this.getPossibleMoves(row, col);
                    if (moves.length > 0) return true;
                }
            }
        }
        return false;
    }

    endGame(message) {
        this.showGameStatus(message, 'success');
        setTimeout(() => {
            if (confirm(message + ' Would you like to start a new game?')) {
                this.newGame();
            }
        }, 1000);
    }

    newGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        
        this.renderBoard();
        this.updateTurnDisplay();
        this.updateGameModeDisplay();
        this.updateCapturedPieces();
        this.updateMoveHistory();
        this.hideGameStatus();
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.newGame();
    }

    setActiveMode(activeButtonId) {
        // Remove active class from all mode buttons
        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to the clicked button
        document.getElementById(activeButtonId).classList.add('active');
    }

    setupEventListeners() {
        // New Game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to start a new game?')) {
                this.newGame();
            }
        });

        // Game Mode Buttons
        document.getElementById('pvp-mode-btn').addEventListener('click', () => {
            this.setGameMode('pvp');
            this.setActiveMode('pvp-mode-btn');
        });

        document.getElementById('pve-mode-btn').addEventListener('click', () => {
            this.setGameMode('ai');
            this.setActiveMode('pve-mode-btn');
        });

        document.getElementById('tournament-mode-btn').addEventListener('click', () => {
            this.showGameStatus('Tournament mode coming soon!', 'warning');
            setTimeout(() => this.hideGameStatus(), 3000);
        });

        document.getElementById('puzzle-mode-btn').addEventListener('click', () => {
            this.showGameStatus('Puzzle mode coming soon!', 'warning');
            setTimeout(() => this.hideGameStatus(), 3000);
        });

        // Undo button
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'block';
        });

        // Settings modal
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
        });

        // Settings options
        document.getElementById('sound-effects').addEventListener('change', (e) => {
            this.gameSettings.soundEffects = e.target.checked;
        });

        document.getElementById('show-coordinates').addEventListener('change', (e) => {
            this.gameSettings.showCoordinates = e.target.checked;
            document.querySelectorAll('.coordinates').forEach(coord => {
                coord.style.display = e.target.checked ? 'flex' : 'none';
            });
        });

        document.getElementById('highlight-moves').addEventListener('change', (e) => {
            this.gameSettings.highlightMoves = e.target.checked;
        });

        document.getElementById('ai-difficulty').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
            this.gameSettings.aiDifficulty = e.target.value;
        });

        // Hint button
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        
        // Restore piece positions
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;

        // Restore captured piece
        if (lastMove.captured) {
            const capturedColor = lastMove.captured.charAt(0) === 'w' ? 'white' : 'black';
            const index = this.capturedPieces[capturedColor].indexOf(lastMove.captured);
            if (index > -1) {
                this.capturedPieces[capturedColor].splice(index, 1);
            }
        }

        this.switchPlayer();
        this.renderBoard();
        this.updateTurnDisplay();
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }

    showGameStatus(message, type = 'success') {
        const statusElement = document.getElementById('game-status');
        statusElement.textContent = message;
        statusElement.className = `game-status ${type}`;
        statusElement.style.display = 'block';
        
        if (type !== 'info') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }
    }

    hideGameStatus() {
        const statusElement = document.getElementById('game-status');
        statusElement.style.display = 'none';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
});
