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
        this.isDragging = false;
        this.draggedPiece = null;

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
            'book': 'https://avatars.mds.yandex.net/get-altay/7730813/2a0000018d07d925674ddbd849313b6cbc73/L_height',
            'library': 'https://avatars.mds.yandex.net/get-altay/16444693/2a00000199a4c698176bd6295674938bb59d/orig',
            'nature': 'https://mkkld.ru/wp-content/uploads/2021/11/thumb_l_26418.jpeg'
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

            // Вычисляем позицию фона
            const row = Math.floor(i / this.size);
            const col = i % this.size;
            const bgX = -col * pieceSize;
            const bgY = -row * pieceSize;

            piece.style.backgroundImage = `url(${imageUrl})`;
            piece.style.backgroundPosition = `${bgX}px ${bgY}px`;
            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;

            // События перетаскивания
            piece.addEventListener('mousedown', (e) => this.startDrag(e, piece));
            piece.addEventListener('touchstart', (e) => this.startDrag(e, piece), { passive: false });

            this.container.appendChild(piece);
            this.pieces.push(piece);
        }

        this.shufflePuzzle();
    }

    // Начало перетаскивания
    startDrag(e, piece) {
        e.preventDefault();
        this.isDragging = true;
        this.draggedPiece = piece;

        // Добавляем обработчики
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        document.addEventListener('touchend', this.stopDrag.bind(this));
    }

    // Перетаскивание
    drag(e) {
        if (!this.isDragging) return;

        e.preventDefault();
        const touch = e.touches ? e.touches[0] : null;
        const x = touch ? touch.clientX : e.clientX;
        const y = touch ? touch.clientY : e.clientY;

        // Проверяем соседние кусочки
        const rect = this.draggedPiece.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Находим ближайший пустой слот
        if (Math.abs(x - centerX) < rect.width * 1.5 && Math.abs(y - centerY) < rect.height * 1.5) {
            this.swapWithEmpty(this.draggedPiece);
        }
    }

    // Обмен с пустым местом
    swapWithEmpty(piece) {
        const currentIndex = parseInt(piece.dataset.index);
        const row = Math.floor(currentIndex / this.size);
        const col = currentIndex % this.size;

        const emptyRow = Math.floor(this.emptySlot / this.size);
        const emptyCol = this.emptySlot % this.size;

        // Проверяем, соседствует ли пустое место
        if (
            (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
            (Math.abs(col - emptyCol) === 1 && row === emptyRow)
        ) {
            // Меняем местами
            const tempIndex = piece.dataset.index;
            piece.dataset.index = this.emptySlot;
            this.emptySlot = parseInt(tempIndex);

            // Анимация
            piece.style.transform = 'scale(1.1)';
            setTimeout(() => {
                piece.style.transform = 'scale(1)';
            }, 100);

            this.checkWin();
        }
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
        for (let i = 0; i < 100; i++) {
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

        // Обновляем отображение
        this.pieces.forEach(piece => {
            piece.classList.remove('correct');
            const index = parseInt(piece.dataset.index);
            const row = Math.floor(index / this.size);
            const col = index % this.size;
            const pieceSize = 400 / this.size;
            const bgX = -col * pieceSize;
            const bgY = -row * pieceSize;
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

    // Остановка перетаскивания
    stopDrag() {
        this.isDragging = false;
        this.draggedPiece = null;
        document.removeEventListener('mousemove', this.drag.bind(this));
        document.removeEventListener('touchmove', this.drag.bind(this));
        document.removeEventListener('mouseup', this.stopDrag.bind(this));
        document.removeEventListener('touchend', this.stopDrag.bind(this));
    }
}

// Инициализация игры при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});
