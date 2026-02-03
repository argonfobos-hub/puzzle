class PuzzleGame {
    constructor() {
        this.container = document.getElementById('puzzle-container');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.imageSelect = document.getElementById('image-select');
        this.completedMessage = document.getElementById('completed-message');
        this.playAgainBtn = document.getElementById('play-again-btn');

        this.size = 4; // 4x4 по умолчанию
        this.pieceSize = 100; // 400px / 4
        this.totalSize = 400;
        this.imageUrl = '';
        this.order = []; // Порядок кусочков: [0, 1, 2, ..., null] где null = пустое место

        this.init();
    }

    init() {
        // События кнопок
        this.shuffleBtn.addEventListener('click', () => this.shufflePuzzle());
        this.resetBtn.addEventListener('click', () => this.resetPuzzle());
        this.playAgainBtn.addEventListener('click', () => this.hideCompletionMessage());

        // События выбора
        this.difficultySelect.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.pieceSize = this.totalSize / this.size;
            this.createPuzzle();
        });

        this.imageSelect.addEventListener('change', (e) => {
            this.imageName = e.target.value;
            this.createPuzzle();
        });

        // Создаём пазл
        this.createPuzzle();
    }

    getImagePath(name) {
        const images = {
            'book': 'https://avatars.mds.yandex.net/get-altay/7730813/2a0000018d07d925674ddbd849313b6cbc73/L_height',
            'library': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3pAgdoOYh2PMymsRpgsVehTRvM0421wmKQA&s',
            'nature': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwMhbnmcLjT4u1zRwLglPs1-eW66KxKw0Tww&s'
        };
        return images[name] || images['book'];
    }

    createPuzzle() {
        this.container.innerHTML = '';
        this.container.style.gridTemplateColumns = `repeat(${this.size}, ${this.pieceSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.size}, ${this.pieceSize}px)`;
        
        this.imageUrl = this.getImagePath(this.imageSelect.value);
        
        // Создаём правильный порядок: [0, 1, 2, ..., пусто]
        this.order = [];
        for (let i = 0; i < this.size * this.size; i++) {
            this.order.push(i);
        }
        this.order[this.size * this.size - 1] = null; // Последняя ячейка - пустая

        this.renderPuzzle();
        this.shufflePuzzle();
    }

    renderPuzzle() {
        this.container.innerHTML = '';

        for (let pos = 0; pos < this.size * this.size; pos++) {
            const pieceNum = this.order[pos];
            
            if (pieceNum !== null) {
                const piece = document.createElement('div');
                piece.className = 'puzzle-piece';
                piece.dataset.piece = pieceNum; // Номер кусочка (его правильная позиция)
                piece.dataset.position = pos;   // Текущая позиция в сетке
                
                // Вычисляем background-position по ПРАВИЛЬНОМУ номеру кусочка
                const row = Math.floor(pieceNum / this.size);
                const col = pieceNum % this.size;
                const bgX = -col * this.pieceSize;
                const bgY = -row * this.pieceSize;
                
                piece.style.backgroundImage = `url(${this.imageUrl})`;
                piece.style.backgroundSize = `${this.totalSize}px ${this.totalSize}px`;
                piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
                piece.style.width = `${this.pieceSize}px`;
                piece.style.height = `${this.pieceSize}px`;
                
                // Клик по кусочку
                piece.addEventListener('click', () => this.movePiece(pos));
                
                this.container.appendChild(piece);
            }
        }
    }

    movePiece(clickedPos) {
        // Находим позицию пустого места
        const emptyPos = this.order.indexOf(null);
        
        // Проверяем, соседние ли позиции
        if (this.isAdjacent(clickedPos, emptyPos)) {
            // Меняем местами кусочек и пустое место
            this.order[emptyPos] = this.order[clickedPos];
            this.order[clickedPos] = null;
            
            // Перерисовываем
            this.renderPuzzle();
            
            // Проверяем победу
            this.checkWin();
        }
    }

    isAdjacent(pos1, pos2) {
        const row1 = Math.floor(pos1 / this.size);
        const col1 = pos1 % this.size;
        const row2 = Math.floor(pos2 / this.size);
        const col2 = pos2 % this.size;
        
        // Соседние по горизонтали или вертикали
        return (
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );
    }

    shufflePuzzle() {
        // Делаем 100 случайных допустимых ходов
        for (let i = 0; i < 100; i++) {
            const emptyPos = this.order.indexOf(null);
            const neighbors = this.getValidMoves(emptyPos);
            
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                // Меняем пустое место с соседним кусочком
                this.order[emptyPos] = this.order[randomNeighbor];
                this.order[randomNeighbor] = null;
            }
        }
        this.renderPuzzle();
    }

    getValidMoves(emptyPos) {
        const moves = [];
        const row = Math.floor(emptyPos / this.size);
        const col = emptyPos % this.size;
        
        // Вверх
        if (row > 0) moves.push(emptyPos - this.size);
        // Вниз
        if (row < this.size - 1) moves.push(emptyPos + this.size);
        // Влево
        if (col > 0) moves.push(emptyPos - 1);
        // Вправо
        if (col < this.size - 1) moves.push(emptyPos + 1);
        
        return moves;
    }

    checkWin() {
        // Проверяем, что все кусочки на своих местах
        for (let i = 0; i < this.size * this.size - 1; i++) {
            if (this.order[i] !== i) {
                return false;
            }
        }
        
        // Победа!
        this.showCompletionMessage();
        return true;
    }

    resetPuzzle() {
        // Восстанавливаем правильный порядок
        for (let i = 0; i < this.size * this.size - 1; i++) {
            this.order[i] = i;
        }
        this.order[this.size * this.size - 1] = null;
        this.renderPuzzle();
    }

    showCompletionMessage() {
        this.completedMessage.style.display = 'flex';
    }

    hideCompletionMessage() {
        this.completedMessage.style.display = 'none';
        this.shufflePuzzle();
    }
}

// Запуск игры
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PuzzleGame();
});
