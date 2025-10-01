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
            aiDifficulty: 'medium',
            autoSave: true,
            confirmMoves: false,
            volume: 50
        };
        
        this.initializeGame();
        this.loadSettings();
        this.initializeTournament();
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
        this.setupTournamentModal();
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
                        setTimeout(() => this.makeAIMove(), 1000);
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
        let moves = [];

        // Get basic moves first
        switch (pieceType) {
            case 'pawn': moves = this.getPawnMoves(row, col, color); break;
            case 'rook': moves = this.getRookMoves(row, col); break;
            case 'knight': moves = this.getKnightMoves(row, col); break;
            case 'bishop': moves = this.getBishopMoves(row, col); break;
            case 'queen': moves = this.getQueenMoves(row, col); break;
            case 'king': moves = this.getKingMoves(row, col); break;
            default: return [];
        }

        // Filter out moves that would leave the king in check
        return moves.filter(move => {
            // Make temporary move
            const originalPiece = this.board[move.row][move.col];
            this.board[move.row][move.col] = piece;
            this.board[row][col] = null;
            
            // Check if king is in check
            const isInCheck = this.isKingInCheck(color);
            
            // Undo temporary move
            this.board[row][col] = piece;
            this.board[move.row][move.col] = originalPiece;
            
            return !isInCheck;
        });
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
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const color = piece.charAt(0);
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            // Check if the target square is within the board
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                
                // If the target square is empty or contains an opponent's piece
                if (!targetPiece || targetPiece.charAt(0) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    // Basic moves without check validation (used for check detection)
    getBasicKnightMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const color = piece.charAt(0);
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.charAt(0) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

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
        // Queen moves like both rook and bishop
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const color = piece.charAt(0);
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dRow, dCol] of kingMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece || targetPiece.charAt(0) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    // Basic moves without check validation (used for check detection)
    getBasicKingMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const color = piece.charAt(0);
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dRow, dCol] of kingMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.charAt(0) !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    isKingInCheck(color) {
        // Find the king's position
        let kingRow, kingCol;
        const kingPiece = color + 'king';
        
        outerLoop:
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === kingPiece) {
                    kingRow = row;
                    kingCol = col;
                    break outerLoop;
                }
            }
        }
        
        // Check if any opponent's piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.charAt(0) !== color) {
                    const moves = this.getBasicMoves(row, col);
                    if (moves.some(move => move.row === kingRow && move.col === kingCol)) {
                        return true; // King is in check
                    }
                }
            }
        }
        
        return false; // King is not in check
    }

    // Get basic moves without check validation to avoid infinite recursion
    getBasicMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const pieceType = piece.slice(1);
        const color = piece.charAt(0);

        switch (pieceType) {
            case 'pawn': return this.getPawnMoves(row, col, color);
            case 'rook': return this.getRookMoves(row, col);
            case 'knight': return this.getBasicKnightMoves(row, col);
            case 'bishop': return this.getBishopMoves(row, col);
            case 'queen': return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
            case 'king': return this.getBasicKingMoves(row, col);
            default: return [];
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const color = piece.charAt(0);
        const targetPiece = this.board[toRow][toCol];
        
        // Make a temporary move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Check if the king is in check after the move
        const isInCheck = this.isKingInCheck(color);
        
        // Undo the temporary move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = targetPiece;
        
        // If the move would leave the king in check, it's not valid
        if (isInCheck) {
            return false;
        }
        
        // Check if the move is in the list of possible moves
        const possibleMoves = this.getPossibleMoves(fromRow, fromCol);
        return possibleMoves.some(move => move.row === toRow && move.col === toCol);
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        // Play appropriate sound
        if (capturedPiece) {
            this.playSound('capture');
        } else {
            this.playSound('move');
        }

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
            if (!container) {
                console.error(`Captured pieces container not found: captured-${color}-pieces`);
                return;
            }
            
            container.innerHTML = '';
            
            // Update the header with count
            const header = container.parentElement.querySelector('h4');
            const count = this.capturedPieces[color].length;
            const colorName = color === 'white' ? 'White' : 'Black';
            header.textContent = `Captured ${colorName} (${count})`;
            
            this.capturedPieces[color].forEach((piece, index) => {
                const img = document.createElement('img');
                const pieceColor = piece.charAt(0).toUpperCase();
                const pieceType = piece.slice(1);
                img.src = `assets/images/${pieceColor}${pieceType}.png`;
                img.className = 'captured-piece';
                img.alt = piece;
                img.title = `${pieceColor}${pieceType} (${index + 1})`;
                img.onerror = () => {
                    console.error(`Failed to load captured piece image: ${img.src}`);
                    // Fallback to text representation
                    const span = document.createElement('span');
                    span.textContent = piece;
                    span.className = 'captured-piece-text';
                    span.title = `${piece} (${index + 1})`;
                    container.appendChild(span);
                };
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
        this.playSound('win');
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

        // Tournament mode is now handled in setupTournamentModal()

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

        // Close modal when clicking outside
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                document.getElementById('settings-modal').style.display = 'none';
            }
        });

        // Settings options
        document.getElementById('sound-effects').addEventListener('change', (e) => {
            this.gameSettings.soundEffects = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('show-coordinates').addEventListener('change', (e) => {
            this.gameSettings.showCoordinates = e.target.checked;
            document.querySelectorAll('.coordinates').forEach(coord => {
                coord.style.display = e.target.checked ? 'flex' : 'none';
            });
            this.saveSettings();
        });

        document.getElementById('highlight-moves').addEventListener('change', (e) => {
            this.gameSettings.highlightMoves = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('ai-difficulty').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
            this.gameSettings.aiDifficulty = e.target.value;
            this.saveSettings();
        });

        document.getElementById('auto-save').addEventListener('change', (e) => {
            this.gameSettings.autoSave = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('confirm-moves').addEventListener('change', (e) => {
            this.gameSettings.confirmMoves = e.target.checked;
            this.saveSettings();
        });

        // Volume control
        document.getElementById('volume-control').addEventListener('input', (e) => {
            this.gameSettings.volume = parseInt(e.target.value);
            document.getElementById('volume-display').textContent = `${e.target.value}%`;
            this.saveSettings();
        });

        // Settings modal buttons
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
            document.getElementById('settings-modal').style.display = 'none';
            this.showGameStatus('Settings saved successfully!', 'success');
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                this.resetSettings();
                this.showGameStatus('Settings reset to defaults!', 'info');
            }
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

    playSound(soundType) {
        if (!this.gameSettings.soundEffects) return;
        
        try {
            let audio;
            switch (soundType) {
                case 'move':
                    // Create move sound using Web Audio API
                    audio = new Audio();
                    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
                    break;
                case 'capture':
                    // Create capture sound
                    audio = new Audio();
                    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
                    break;
                case 'win':
                    // Create win sound
                    audio = new Audio();
                    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
                    break;
                default:
                    return;
            }
            
            // Fallback to generating sounds programmatically
            this.generateSound(soundType);
            
        } catch (error) {
            console.warn('Could not play sound:', error);
            // Fallback to generating sounds programmatically
            this.generateSound(soundType);
        }
    }

    generateSound(soundType) {
        if (!this.gameSettings.soundEffects) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            switch (soundType) {
                case 'move':
                    // Gentle wood-like click for piece movement
                    this.createClickSound(audioContext, 600, 0.08, 0.12);
                    break;
                    
                case 'capture':
                    // Dramatic capture sound with multiple frequencies
                    this.createCaptureSound(audioContext);
                    break;
                    
                case 'win':
                    // Victory fanfare with chord progression
                    this.createWinSound(audioContext);
                    break;
                    
                default:
                    return;
            }
            
        } catch (error) {
            console.warn('Could not generate sound:', error);
        }
    }

    createClickSound(audioContext, frequency, volume, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const adjustedVolume = volume * (this.gameSettings.volume / 100);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, audioContext.currentTime + duration);
        gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        oscillator.type = 'triangle';
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    createCaptureSound(audioContext) {
        // Create a more complex capture sound with multiple oscillators
        const frequencies = [800, 400, 200];
        const duration = 0.25;
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(freq * 0.3, audioContext.currentTime + duration);
            const adjustedVolume = (0.15 / (index + 1)) * (this.gameSettings.volume / 100);
            gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            oscillator.type = index === 0 ? 'sawtooth' : 'square';
            
            oscillator.start(audioContext.currentTime + index * 0.05);
            oscillator.stop(audioContext.currentTime + duration + index * 0.05);
        });
    }

    createWinSound(audioContext) {
        // Create a victory fanfare with chord progression
        const chords = [
            [523, 659, 784], // C major
            [587, 740, 880], // D major  
            [659, 831, 988], // E major
            [698, 880, 1047] // F major
        ];
        
        chords.forEach((chord, chordIndex) => {
            chord.forEach((freq, noteIndex) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + chordIndex * 0.2);
                const adjustedVolume = 0.1 * (this.gameSettings.volume / 100);
                gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime + chordIndex * 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + chordIndex * 0.2 + 0.4);
                oscillator.type = 'sine';
                
                oscillator.start(audioContext.currentTime + chordIndex * 0.2);
                oscillator.stop(audioContext.currentTime + chordIndex * 0.2 + 0.4);
            });
        });
    }

    saveSettings() {
        try {
            localStorage.setItem('chessGameSettings', JSON.stringify(this.gameSettings));
        } catch (error) {
            console.warn('Could not save settings to localStorage:', error);
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('chessGameSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.gameSettings = { ...this.gameSettings, ...settings };
                this.applySettings();
            }
        } catch (error) {
            console.warn('Could not load settings from localStorage:', error);
        }
    }

    applySettings() {
        // Apply sound effects setting
        document.getElementById('sound-effects').checked = this.gameSettings.soundEffects;
        
        // Apply coordinates setting
        document.getElementById('show-coordinates').checked = this.gameSettings.showCoordinates;
        document.querySelectorAll('.coordinates').forEach(coord => {
            coord.style.display = this.gameSettings.showCoordinates ? 'flex' : 'none';
        });
        
        // Apply move highlighting setting
        document.getElementById('highlight-moves').checked = this.gameSettings.highlightMoves;
        
        // Apply AI difficulty setting
        document.getElementById('ai-difficulty').value = this.gameSettings.aiDifficulty;
        this.aiDifficulty = this.gameSettings.aiDifficulty;
        
        // Apply auto-save setting
        if (document.getElementById('auto-save')) {
            document.getElementById('auto-save').checked = this.gameSettings.autoSave || false;
        }
        
        // Apply confirm moves setting
        if (document.getElementById('confirm-moves')) {
            document.getElementById('confirm-moves').checked = this.gameSettings.confirmMoves || false;
        }

        // Apply volume setting
        if (document.getElementById('volume-control')) {
            const volume = this.gameSettings.volume || 50;
            document.getElementById('volume-control').value = volume;
            document.getElementById('volume-display').textContent = `${volume}%`;
        }
    }

    resetSettings() {
        this.gameSettings = {
            soundEffects: true,
            showCoordinates: true,
            highlightMoves: true,
            aiDifficulty: 'medium',
            autoSave: true,
            confirmMoves: false,
            volume: 50
        };
        this.applySettings();
        this.saveSettings();
    }

    // Tournament System
    initializeTournament() {
        this.tournament = {
            name: '',
            players: [],
            bracket: [],
            currentRound: 0,
            currentMatch: 0,
            winner: null
        };
    }

    setupTournamentModal() {
        // Tournament modal event listeners
        document.getElementById('tournament-mode-btn').addEventListener('click', () => {
            document.getElementById('tournament-modal').style.display = 'block';
            this.generatePlayerInputs();
        });

        document.getElementById('tournament-close').addEventListener('click', () => {
            document.getElementById('tournament-modal').style.display = 'none';
        });

        document.getElementById('player-count').addEventListener('change', () => {
            this.generatePlayerInputs();
        });

        document.getElementById('start-tournament').addEventListener('click', () => {
            this.startTournament();
        });

        document.getElementById('new-tournament').addEventListener('click', () => {
            this.resetTournament();
        });

        document.getElementById('next-match').addEventListener('click', () => {
            this.nextMatch();
        });
    }

    generatePlayerInputs() {
        const playerCount = parseInt(document.getElementById('player-count').value);
        const container = document.getElementById('player-inputs');
        container.innerHTML = '';

        for (let i = 1; i <= playerCount; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-input';
            input.placeholder = `Player ${i} Name`;
            input.value = `Player ${i}`;
            container.appendChild(input);
        }
    }

    startTournament() {
        const playerInputs = document.querySelectorAll('.player-input');
        const players = Array.from(playerInputs).map(input => input.value.trim()).filter(name => name);
        
        if (players.length < 4) {
            alert('Tournament needs at least 4 players!');
            return;
        }

        this.tournament.name = document.getElementById('tournament-name').value || 'Chess Championship';
        this.tournament.players = players;
        this.generateBracket();
        this.displayTournament();
    }

    generateBracket() {
        const players = [...this.tournament.players];
        this.shuffleArray(players); // Randomize seeding
        
        this.tournament.bracket = [];
        this.tournament.currentRound = 0;
        this.tournament.currentMatch = 0;

        // Create first round matches
        const firstRound = [];
        for (let i = 0; i < players.length; i += 2) {
            firstRound.push({
                player1: players[i],
                player2: players[i + 1],
                winner: null,
                completed: false
            });
        }
        this.tournament.bracket.push(firstRound);

        // Generate subsequent rounds
        let currentRoundSize = firstRound.length;
        while (currentRoundSize > 1) {
            const nextRound = [];
            for (let i = 0; i < currentRoundSize / 2; i++) {
                nextRound.push({
                    player1: null,
                    player2: null,
                    winner: null,
                    completed: false
                });
            }
            this.tournament.bracket.push(nextRound);
            currentRoundSize = nextRound.length;
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    displayTournament() {
        document.getElementById('tournament-setup').style.display = 'none';
        document.getElementById('tournament-bracket').style.display = 'block';
        document.getElementById('tournament-title').textContent = this.tournament.name;
        
        this.renderBracket();
        this.highlightCurrentMatch();
    }

    renderBracket() {
        const bracketContainer = document.getElementById('bracket-display');
        bracketContainer.innerHTML = '';

        const roundNames = ['Quarter Finals', 'Semi Finals', 'Finals'];
        if (this.tournament.bracket.length === 2) roundNames.shift();
        if (this.tournament.bracket.length === 1) roundNames.shift();

        this.tournament.bracket.forEach((round, roundIndex) => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'bracket-round';
            
            const roundTitle = document.createElement('h4');
            roundTitle.textContent = roundNames[roundIndex] || `Round ${roundIndex + 1}`;
            roundDiv.appendChild(roundTitle);

            round.forEach((match, matchIndex) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'bracket-match';
                matchDiv.dataset.round = roundIndex;
                matchDiv.dataset.match = matchIndex;

                if (match.completed) {
                    matchDiv.classList.add('completed');
                } else if (roundIndex === this.tournament.currentRound && matchIndex === this.tournament.currentMatch) {
                    matchDiv.classList.add('active');
                }

                const player1Div = document.createElement('div');
                player1Div.className = 'match-player';
                if (match.winner === match.player1) player1Div.classList.add('winner');
                else if (match.completed) player1Div.classList.add('loser');
                player1Div.innerHTML = `<span>${match.player1 || 'TBD'}</span>`;

                const player2Div = document.createElement('div');
                player2Div.className = 'match-player';
                if (match.winner === match.player2) player2Div.classList.add('winner');
                else if (match.completed) player2Div.classList.add('loser');
                player2Div.innerHTML = `<span>${match.player2 || 'TBD'}</span>`;

                matchDiv.appendChild(player1Div);
                matchDiv.appendChild(player2Div);

                // Add click handler for active matches
                if (!match.completed && match.player1 && match.player2) {
                    matchDiv.style.cursor = 'pointer';
                    matchDiv.addEventListener('click', () => {
                        this.playMatch(roundIndex, matchIndex);
                    });
                }

                roundDiv.appendChild(matchDiv);
            });

            bracketContainer.appendChild(roundDiv);
        });
    }

    highlightCurrentMatch() {
        const currentMatch = this.getCurrentMatch();
        if (currentMatch && currentMatch.player1 && currentMatch.player2) {
            document.getElementById('next-match').style.display = 'block';
        } else {
            document.getElementById('next-match').style.display = 'none';
        }
    }

    getCurrentMatch() {
        if (this.tournament.currentRound >= this.tournament.bracket.length) return null;
        return this.tournament.bracket[this.tournament.currentRound][this.tournament.currentMatch];
    }

    playMatch(roundIndex, matchIndex) {
        const match = this.tournament.bracket[roundIndex][matchIndex];
        if (!match.player1 || !match.player2 || match.completed) return;

        // Simulate match or allow manual winner selection
        const winner = confirm(`${match.player1} vs ${match.player2}\n\nClick OK if ${match.player1} wins, Cancel if ${match.player2} wins.`) 
            ? match.player1 : match.player2;
        
        this.completeMatch(roundIndex, matchIndex, winner);
    }

    completeMatch(roundIndex, matchIndex, winner) {
        const match = this.tournament.bracket[roundIndex][matchIndex];
        match.winner = winner;
        match.completed = true;

        // Advance winner to next round
        if (roundIndex + 1 < this.tournament.bracket.length) {
            const nextRoundMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = this.tournament.bracket[roundIndex + 1][nextRoundMatchIndex];
            
            if (matchIndex % 2 === 0) {
                nextMatch.player1 = winner;
            } else {
                nextMatch.player2 = winner;
            }
        } else {
            // Tournament winner!
            this.tournament.winner = winner;
            this.showTournamentWinner();
        }

        this.renderBracket();
        this.advanceToNextMatch();
    }

    advanceToNextMatch() {
        // Find next unplayed match
        for (let roundIndex = 0; roundIndex < this.tournament.bracket.length; roundIndex++) {
            const round = this.tournament.bracket[roundIndex];
            for (let matchIndex = 0; matchIndex < round.length; matchIndex++) {
                const match = round[matchIndex];
                if (!match.completed && match.player1 && match.player2) {
                    this.tournament.currentRound = roundIndex;
                    this.tournament.currentMatch = matchIndex;
                    this.highlightCurrentMatch();
                    return;
                }
            }
        }
        
        // No more matches
        document.getElementById('next-match').style.display = 'none';
    }

    nextMatch() {
        const currentMatch = this.getCurrentMatch();
        if (currentMatch) {
            this.playMatch(this.tournament.currentRound, this.tournament.currentMatch);
        }
    }

    showTournamentWinner() {
        const bracketContainer = document.getElementById('bracket-display');
        const winnerDiv = document.createElement('div');
        winnerDiv.className = 'tournament-winner';
        winnerDiv.innerHTML = `
            <div class="trophy">🏆</div>
            <h2>Tournament Champion</h2>
            <h3>${this.tournament.winner}</h3>
            <p>Congratulations on winning ${this.tournament.name}!</p>
        `;
        bracketContainer.appendChild(winnerDiv);
        
        this.playSound('win');
    }

    resetTournament() {
        this.initializeTournament();
        document.getElementById('tournament-setup').style.display = 'block';
        document.getElementById('tournament-bracket').style.display = 'none';
        this.generatePlayerInputs();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
});
