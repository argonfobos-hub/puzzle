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
        this.pieces = [];
        this.emptySlot = null;

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
            'book': 'https://images.unsplash.com/photo-1544942590-74c2ad183b5f?w=800',
            'library': 'https://images.unsplash.com/photo-1507842217343-583bb7270b5b?w=800',
            'nature': 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=800'
        };
        return images[name] || images['book'];
    }

    // Создаем пазл
    createPuzzle() {
        this.container.innerHTML = '';
        this.pieces = [];
        this.emptySlot = this.size * this.size - 1;

        const imageUrl = this.getImagePath(this.imageName);
        const pieceSize = 400 / this.size;
        const totalSize = 400;

        // Устанавливаем размеры контейнера
        this.container.style.gridTemplateColumns = `repeat(${this.size}, ${pieceSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${this.size}, ${pieceSize}px)`;

        // Создаем все кусочки
        for (let i = 0; i < this.size * this.size; i++) {
            if (i === this.emptySlot) continue;

            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.index = i;
            piece.dataset.correctIndex = i;

            // Вычисляем позицию фона для КОРРЕКТНОЙ позиции
            const correctRow = Math.floor(i / this.size);
            const correctCol = i % this.size;
            
            // background-size должен быть размером ВСЕГО пазла
            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundSize = `${totalSize}px ${totalSize}px`;
            
            // Позиционируем фон: сдвигаем влево и вверх
            const bgX = -correctCol * pieceSize;
            const bgY = -correctRow * pieceSize;
            piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
            
            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;

            // Событие клика - меняем местами с пустым слотом
            piece.addEventListener('click', () => this.handleClick(piece));

            this.container.appendChild(piece);
            this.pieces.push(piece);
        }

        this.shufflePuzzle();
    }

    // Обработка клика по кусочку
    handleClick(piece) {
        const currentIndex = parseInt(piece.dataset.index);
        const currentRow = Math.floor(currentIndex / this.size);
        const currentCol = currentIndex % this.size;

        const emptyRow = Math.floor(this.emptySlot / this.size);
        const emptyCol = this.emptySlot % this.size;

        // Проверяем, соседствует ли пустое место (вверх, вниз, влево, вправо)
        const isAdjacent = 
            (Math.abs(currentRow - emptyRow) === 1 && currentCol === emptyCol) ||
            (Math.abs(currentCol - emptyCol) === 1 && currentRow === emptyRow);

        if (isAdjacent) {
            // Меняем местами
            const tempIndex = piece.dataset.index;
            piece.dataset.index = this.emptySlot;
            this.emptySlot = parseInt(tempIndex);

            // Анимация
            piece.classList.add('correct');
            setTimeout(() => {
                piece.classList.remove('correct');
            }, 100);

            // Обновляем позицию фона
            this.updatePiecePosition(piece);

            // Проверяем победу
            this.checkWin();
        }
    }

    // Обновляем позицию фона кусочка
    updatePiecePosition(piece) {
        const pieceSize = 400 / this.size;
        const currentIndex = parseInt(piece.dataset.index);
        const currentRow = Math.floor(currentIndex / this.size);
        const currentCol = currentIndex % this.size;
        
        const bgX = -currentCol * pieceSize;
        const bgY = -currentRow * pieceSize;
        piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }

    // Проверка победы
    checkWin() {
        let win = true;
        this.pieces.forEach(piece => {
            if (piece.dataset.index !== piece.dataset.correctIndex) {
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
        // Простой алгоритм перемешивания
        for (let i = 0; i < 200; i++) {
            const emptyRow = Math.floor(this.emptySlot / this.size);
            const emptyCol = this.emptySlot % this.size;

            const directions = [];
            if (emptyRow > 0) directions.push(-this.size); // вверх
            if (emptyRow < this.size - 1) directions.push(this.size); // вниз
            if (emptyCol > 0) directions.push(-1); // влево
            if (emptyCol < this.size - 1) directions.push(1); // вправо

            if (directions.length > 0) {
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                const targetIndex = this.emptySlot + randomDir;

                // Находим кусочек на целевой позиции
                const targetPiece = this.pieces.find(p => p.dataset.index == targetIndex);
                if (targetPiece) {
                    targetPiece.dataset.index = this.emptySlot;
                    this.emptySlot = targetIndex;
                }
            }
        }

        // Обновляем отображение - ПЕРЕПОЗИЦИОНИРУЕМ фон
        const pieceSize = 400 / this.size;
        this.pieces.forEach(piece => {
            piece.classList.remove('correct');
            const currentIndex = parseInt(piece.dataset.index);
            const currentRow = Math.floor(currentIndex / this.size);
            const currentCol = currentIndex % this.size;
            
            // Сдвигаем фон в зависимости от ТЕКУЩЕЙ позиции кусочка
            const bgX = -currentCol * pieceSize;
            const bgY = -currentRow * pieceSize;
            piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
        });
    }

    // Сброс пазла
    resetPuzzle() {
        this.emptySlot = this.size * this.size - 1;
        this.pieces.forEach(piece => {
            piece.dataset.index = piece.dataset.correctIndex;
            piece.classList.remove('correct');
        });
        this.shufflePuzzle();
    }

    // Показать сообщение о победе
    showCompletionMessage() {
        this.completedMessage.style.display = 'flex';
    }

    // Скрыть сообщение
    hideCompletionMessage() {
        this.completedMessage.style.display = 'none';
        this.resetPuzzle();
    }
}

// Инициализация игры при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});
