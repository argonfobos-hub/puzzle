class PuzzleGame {
    constructor() {
        this.container = document.getElementById('puzzle-container');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.imageSelect = document.getElementById('image-select');
        this.completedMessage = document.getElementById('completed-message');
        this.playAgainBtn = document.getElementById('play-again-btn');

        this.size = parseInt(this.difficultySelect.value);
        this.imageName = this.imageSelect.value;
        this.pieceSize = 400 / this.size;
        this.totalSize = 400;
        this.imageUrl = '';
        this.positions = []; // Массив текущих позиций кусочков

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
            this.pieceSize = 400 / this.size;
            this.createPuzzle();
        });

        this.imageSelect.addEventListener('change', (e) => {
            this.imageName = e.target.value;
            this.createPuzzle();
        });

        // Создаем пазл
        this.createPuzzle();
    }

    // Получаем путь к изображению
    getImagePath(name) {
        const images = {
            'book': 'https://mstrok.ru/sites/default/files/news-images/ms-172420-1.jpg',
            'library': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMoYiOhjh4_b_G6uwhPNaPfTDHDh0fHwzugw&s',
            'nature': 'https://mstrok.ru/sites/default/files/news-images/ms-158405-13.jpg'
        };
        return images[name] || images['book'];
    }

    // Создаем пазл
    createPuzzle() {
        this.container.innerHTML = '';
        this.imageUrl = this.getImagePath(this.imageName);

        // Устанавливаем размеры контейнера
        this.container.style.gridTemplateColumns = `repeat(${this.size}, ${this.pieceSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.size}, ${this.pieceSize}px)`;

        // Инициализируем позиции: [0, 1, 2, ..., пусто]
        this.positions = [];
        for (let i = 0; i < this.size * this.size; i++) {
            this.positions.push(i);
        }

        // Создаем все кусочки
        for (let i = 0; i < this.size * this.size - 1; i++) {
            this.createPiece(i);
        }

        this.shufflePuzzle();
    }

    // Создаем один кусочек
    createPiece(index) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.dataset.index = index; // Правильная позиция

        // Вычисляем позицию фона для правильной позиции
        const row = Math.floor(index / this.size);
        const col = index % this.size;
        
        piece.style.backgroundImage = `url(${this.imageUrl})`;
        piece.style.backgroundSize = `${this.totalSize}px ${this.totalSize}px`;
        
        const bgX = -col * this.pieceSize;
        const bgY = -row * this.pieceSize;
        piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
        
        piece.style.width = `${this.pieceSize}px`;
        piece.style.height = `${this.pieceSize}px`;

        // Событие клика
        piece.addEventListener('click', () => this.handleClick(piece));

        this.container.appendChild(piece);
    }

    // Обработка клика по кусочку
    handleClick(piece) {
        const correctIndex = parseInt(piece.dataset.index);
        
        // Находим текущую позицию этого кусочка
        const currentPosition = this.positions.indexOf(correctIndex);
        if (currentPosition === -1) return;

        // Находим позицию пустого места
        const emptyPosition = this.positions.indexOf(this.size * this.size - 1);

        // Проверяем, соседствуют ли они
        if (this.areAdjacent(currentPosition, emptyPosition)) {
            // Меняем местами
            this.positions[currentPosition] = this.size * this.size - 1;
            this.positions[emptyPosition] = correctIndex;

            // Анимация клика
            piece.style.transform = 'scale(0.95)';
            setTimeout(() => {
                piece.style.transform = 'scale(1)';
                // Обновляем все позиции
                this.updateAllPieces();
                // Проверяем победу
                this.checkWin();
            }, 100);
        }
    }

    // Проверяем, соседствуют ли две позиции
    areAdjacent(pos1, pos2) {
        const row1 = Math.floor(pos1 / this.size);
        const col1 = pos1 % this.size;
        const row2 = Math.floor(pos2 / this.size);
        const col2 = pos2 % this.size;

        return (
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );
    }

    // Обновляем позиции всех кусочков
    updateAllPieces() {
        const pieces = this.container.querySelectorAll('.puzzle-piece');
        
        pieces.forEach(piece => {
            const correctIndex = parseInt(piece.dataset.index);
            const currentPosition = this.positions.indexOf(correctIndex);
            
            if (currentPosition !== -1) {
                const row = Math.floor(currentPosition / this.size);
                const col = currentPosition % this.size;
                
                const bgX = -col * this.pieceSize;
                const bgY = -row * this.pieceSize;
                piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
            }
        });
    }

    // Проверка победы
    checkWin() {
        let win = true;
        const pieces = this.container.querySelectorAll('.puzzle-piece');

        pieces.forEach(piece => {
            const correctIndex = parseInt(piece.dataset.index);
            const currentPosition = this.positions.indexOf(correctIndex);
            
            if (currentPosition !== correctIndex) {
                win = false;
                piece.classList.remove('correct');
            } else {
                piece.classList.add('correct');
            }
        });

        if (win) {
            this.showCompletionMessage();
        }
    }

    // Перемешать пазл
    shufflePuzzle() {
        // Перемешиваем массив позиций
        for (let i = this.positions.length - 1; i > 0; i--) {
            const emptyPos = this.positions.indexOf(this.size * this.size - 1);
            
            // Находим соседние клетки с пустым местом
            const neighbors = this.getNeighbors(emptyPos);
            
            if (neighbors.length > 0) {
                // Случайный сосед
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Меняем местами с пустым местом
                const temp = this.positions[emptyPos];
                this.positions[emptyPos] = this.positions[randomNeighbor];
                this.positions[randomNeighbor] = temp;
            }
        }

        // Делаем дополнительные случайные ходы для лучшего перемешивания
        for (let i = 0; i < 50; i++) {
            const emptyPos = this.positions.indexOf(this.size * this.size - 1);
            const neighbors = this.getNeighbors(emptyPos);
            
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                const temp = this.positions[emptyPos];
                this.positions[emptyPos] = this.positions[randomNeighbor];
                this.positions[randomNeighbor] = temp;
            }
        }

        // Обновляем отображение
        this.updateAllPieces();
        
        // Убираем подсветку правильных позиций
        const pieces = this.container.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => piece.classList.remove('correct'));
    }

    // Получаем соседние клетки
    getNeighbors(position) {
        const neighbors = [];
        const row = Math.floor(position / this.size);
        const col = position % this.size;

        // Вверх
        if (row > 0) neighbors.push(position - this.size);
        // Вниз
        if (row < this.size - 1) neighbors.push(position + this.size);
        // Влево
        if (col > 0) neighbors.push(position - 1);
        // Вправо
        if (col < this.size - 1) neighbors.push(position + 1);

        return neighbors;
    }

    // Сброс пазла
    resetPuzzle() {
        // Восстанавливаем правильный порядок
        for (let i = 0; i < this.size * this.size; i++) {
            this.positions[i] = i;
        }
        this.updateAllPieces();
        
        const pieces = this.container.querySelectorAll('.puzzle-piece');
        pieces.forEach(piece => piece.classList.remove('correct'));
    }

    // Показать сообщение о победе
    showCompletionMessage() {
        this.completedMessage.style.display = 'flex';
    }

    // Скрыть сообщение
    hideCompletionMessage() {
        this.completedMessage.style.display = 'none';
        this.shufflePuzzle();
    }
}

// Инициализация игры при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});
