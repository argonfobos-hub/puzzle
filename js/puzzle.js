class CosmicPuzzle {
    constructor() {
        this.size = 3;
        this.currentImage = 8;
        this.pieces = [];
        this.board = Array(9).fill(null);
        
        // ✅ Ссылки на картинки (без пробелов!)
        this.images = {
            1: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/1.jpg',
            2: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/2.jpg',
            3: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/3.jpg',
            4: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/4.jpg',
            5: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/5.jpg',
            6: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/6.jpg',
            7: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/7.jpg',
            8: 'https://raw.githubusercontent.com/argonfobos-hub/puzzle/refs/heads/main/8.jpg'
        };
        
        this.boardElement = document.getElementById('puzzle-board');
        this.piecesContainer = document.getElementById('pieces-container');
        this.imageSelect = document.getElementById('image-select');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.winScreen = document.getElementById('win-screen');
        this.completedImage = document.getElementById('completed-image');
        this.nextBtn = document.getElementById('next-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        this.createCosmicBackground();
        this.init();
    }
    
    createCosmicBackground() {
        // Создаём мерцающие звёзды
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = `${Math.random() * 3 + 1}px`;
            star.style.height = star.style.width;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.animationDuration = `${Math.random() * 2 + 2}s`;
            document.body.appendChild(star);
        }
        
        // Создаём туманности
        const colors = ['#667eea', '#764ba2', '#4facfe', '#00f2fe', '#43e97b', '#f3904f'];
        for (let i = 0; i < 6; i++) {
            const nebula = document.createElement('div');
            nebula.className = 'nebula';
            nebula.style.width = `${Math.random() * 300 + 150}px`;
            nebula.style.height = nebula.style.width;
            nebula.style.left = `${Math.random() * 100}%`;
            nebula.style.top = `${Math.random() * 100}%`;
            nebula.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            nebula.style.animationDelay = `${Math.random() * 5}s`;
            nebula.style.zIndex = '-1';
            document.body.appendChild(nebula);
        }
    }
    
    init() {
        this.currentImage = parseInt(this.imageSelect.value);
        this.createPuzzle();
        
        this.imageSelect.addEventListener('change', (e) => {
            this.currentImage = parseInt(e.target.value);
            this.createPuzzle();
        });
        
        this.shuffleBtn.addEventListener('click', () => this.shufflePieces());
        this.resetBtn.addEventListener('click', () => this.resetPuzzle());
        this.nextBtn.addEventListener('click', () => this.nextPuzzle());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
    }
    
    createPuzzle() {
        this.pieces = [];
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            this.pieces.push({
                id: i,
                row: row,
                col: col,
                placed: false
            });
        }
        
        this.boardElement.innerHTML = '';
        this.board = Array(9).fill(null);
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.index = i;
            
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleDrop(e, i);
            });
            
            this.boardElement.appendChild(cell);
        }
        
        this.shufflePieces();
    }
    
    // ✅ Хаотичное расположение кусочков
    shufflePieces() {
        this.piecesContainer.innerHTML = '';
        const shuffled = [...this.pieces].sort(() => Math.random() - 0.5);
        
        const occupiedPositions = [];
        
        shuffled.forEach((piece) => {
            if (!piece.placed) {
                const pieceEl = document.createElement('div');
                pieceEl.className = 'puzzle-piece loose';
                pieceEl.draggable = true;
                pieceEl.dataset.pieceId = piece.id;
                
                const pieceSize = 100;
                const bgX = -piece.col * 150;
                const bgY = -piece.row * 150;
                
                pieceEl.style.backgroundImage = `url(${this.images[this.currentImage]})`;
                pieceEl.style.backgroundSize = `450px 450px`;
                pieceEl.style.backgroundPosition = `${bgX}px ${bgY}px`;
                
                const pos = this.getRandomPosition(occupiedPositions, pieceSize);
                pieceEl.style.left = `${pos.x}px`;
                pieceEl.style.top = `${pos.y}px`;
                
                const rotation = Math.random() * 30 - 15;
                pieceEl.style.transform = `rotate(${rotation}deg)`;
                
                pieceEl.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('pieceId', piece.id);
                    e.dataTransfer.setData('source', 'container');
                });
                
                this.piecesContainer.appendChild(pieceEl);
            }
        });
    }
    
    // ✅ Случайная позиция без наложений
    getRandomPosition(occupied, size) {
        const containerWidth = 500;
        const containerHeight = 400;
        const padding = 20;
        
        let attempts = 0;
        let x, y, overlaps;
        
        do {
            x = Math.random() * (containerWidth - size - padding * 2) + padding;
            y = Math.random() * (containerHeight - size - padding * 2) + padding;
            
            overlaps = occupied.some(pos => 
                Math.abs(pos.x - x) < size + 10 && 
                Math.abs(pos.y - y) < size + 10
            );
            
            attempts++;
        } while (overlaps && attempts < 100);
        
        occupied.push({x, y});
        return {x, y};
    }
    
    handleDrop(e, targetIndex) {
        const source = e.dataTransfer.getData('source');
        const pieceId = e.dataTransfer.getData('pieceId');
        
        if (source === 'container') {
            this.dropFromContainer(pieceId, targetIndex);
        } else if (source === 'board') {
            this.dropFromBoard(pieceId, targetIndex);
        }
    }
    
    dropFromContainer(pieceId, targetIndex) {
        if (this.board[targetIndex] !== null) return;
        
        const pieceData = this.pieces.find(p => p.id === parseInt(pieceId));
        if (!pieceData || pieceData.placed) return;
        
        const pieceEl = document.createElement('div');
        pieceEl.className = 'puzzle-piece';
        pieceEl.draggable = true;
        pieceEl.dataset.pieceId = pieceId;
        
        const pieceSize = 150;
        const bgX = -pieceData.col * pieceSize;
        const bgY = -pieceData.row * pieceSize;
        
        pieceEl.style.backgroundImage = `url(${this.images[this.currentImage]})`;
        pieceEl.style.backgroundSize = `450px 450px`;
        pieceEl.style.backgroundPosition = `${bgX}px ${bgY}px`;
        
        pieceEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('pieceId', pieceId);
            e.dataTransfer.setData('source', 'board');
        });
        
        const targetCell = this.boardElement.children[targetIndex];
        targetCell.innerHTML = '';
        targetCell.appendChild(pieceEl);
        targetCell.classList.add('occupied');
        
        this.board[targetIndex] = pieceData.id;
        pieceData.placed = true;
        
        const originalPiece = this.piecesContainer.querySelector(`[data-piece-id="${pieceId}"]`);
        if (originalPiece) originalPiece.remove();
        
        this.checkPosition(targetIndex, pieceData);
        this.checkWin();
    }
    
    dropFromBoard(pieceId, targetIndex) {
        const pieceData = this.pieces.find(p => p.id === parseInt(pieceId));
        if (!pieceData) return;
        
        const currentBoardIndex = this.board.indexOf(parseInt(pieceId));
        if (currentBoardIndex === -1) return;
        
        const targetCell = this.boardElement.children[targetIndex];
        
        if (targetCell && this.board[targetIndex] === null) {
            const currentCell = this.boardElement.children[currentBoardIndex];
            const pieceElToMove = currentCell.querySelector('.puzzle-piece');
            
            if (pieceElToMove) {
                targetCell.innerHTML = '';
                targetCell.appendChild(pieceElToMove);
                targetCell.classList.add('occupied');
                
                currentCell.innerHTML = '';
                currentCell.classList.remove('occupied', 'correct', 'wrong');
                
                this.board[targetIndex] = pieceData.id;
                this.board[currentBoardIndex] = null;
                
                this.checkPosition(targetIndex, pieceData);
            }
        } else {
            const currentCell = this.boardElement.children[currentBoardIndex];
            const pieceEl = currentCell.querySelector('.puzzle-piece');
            
            if (pieceEl) {
                this.piecesContainer.appendChild(pieceEl);
                currentCell.innerHTML = '';
                currentCell.classList.remove('occupied', 'correct', 'wrong');
                
                this.board[currentBoardIndex] = null;
                pieceData.placed = false;
            }
        }
        
        this.checkWin();
    }
    
    checkPosition(cellIndex, pieceData) {
        const cell = this.boardElement.children[cellIndex];
        const targetRow = Math.floor(cellIndex / 3);
        const targetCol = cellIndex % 3;
        
        cell.classList.remove('correct', 'wrong');
        
        if (targetRow === pieceData.row && targetCol === pieceData.col) {
            cell.classList.add('correct');
        } else {
            cell.classList.add('wrong');
        }
    }
    
    checkWin() {
        let win = true;
        for (let i = 0; i < 9; i++) {
            const pieceId = this.board[i];
            if (pieceId === null) {
                win = false;
                break;
            }
            const piece = this.pieces.find(p => p.id === pieceId);
            const targetRow = Math.floor(i / 3);
            const targetCol = i % 3;
            if (piece.row !== targetRow || piece.col !== targetCol) {
                win = false;
                break;
            }
        }
        
        if (win) {
            this.completedImage.src = this.images[this.currentImage];
            this.winScreen.style.display = 'flex';
        }
    }
    
    nextPuzzle() {
        this.winScreen.style.display = 'none';
        this.currentImage = this.currentImage < 8 ? this.currentImage + 1 : 1;
        this.imageSelect.value = this.currentImage;
        this.resetPuzzle();
    }
    
    resetPuzzle() {
        this.pieces.forEach(p => p.placed = false);
        this.board = Array(9).fill(null);
        
        for (let i = 0; i < 9; i++) {
            const cell = this.boardElement.children[i];
            cell.innerHTML = '';
            cell.classList.remove('occupied', 'correct', 'wrong');
        }
        
        this.shufflePieces();
    }
    
    playAgain() {
        this.winScreen.style.display = 'none';
        this.resetPuzzle();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CosmicPuzzle();
});
