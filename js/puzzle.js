// БЫЛО ❌
shufflePieces() {
    this.piecesContainer.innerHTML = '';
    const shuffled = [...this.pieces].sort(() => Math.random() - 0.5);
    
    shuffled.forEach((piece) => {
        if (!piece.placed) {
            const pieceEl = document.createElement('div');
            pieceEl.className = 'puzzle-piece';
            pieceEl.draggable = true;
            pieceEl.dataset.pieceId = piece.id;
            
            const pieceSize = 150;
            const bgX = -piece.col * pieceSize;
            const bgY = -piece.row * pieceSize;
            
            pieceEl.style.backgroundImage = `url(${this.images[this.currentImage]})`;
            pieceEl.style.backgroundSize = `450px 450px`;
            pieceEl.style.backgroundPosition = `${bgX}px ${bgY}px`;
            
            pieceEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('pieceId', piece.id);
                e.dataTransfer.setData('source', 'container');
            });
            
            this.piecesContainer.appendChild(pieceEl);
        }
    });
}

// СТАЛО ✅
shufflePieces() {
    this.piecesContainer.innerHTML = '';
    const shuffled = [...this.pieces].sort(() => Math.random() - 0.5);
    
    // Занимаемые позиции (чтобы кусочки не накладывались)
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
            
            // Хаотичная позиция в контейнере
            const pos = this.getRandomPosition(occupiedPositions, pieceSize);
            pieceEl.style.left = `${pos.x}px`;
            pieceEl.style.top = `${pos.y}px`;
            
            // Поворот для хаотичности
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

// Добавьте новый метод для случайной позиции
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
