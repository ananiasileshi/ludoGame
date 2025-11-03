COLOR_MAP = {red: '#dc2626', blue: '#2563eb', green: '#16a34a', yellow: '#eab308'};

if (typeof game !== 'undefined') {
    game.drawBoard = function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        
        const colors = {
            red: '#dc2626',
            blue: '#2563eb',
            green: '#16a34a',
            yellow: '#eab308'
        };
        
        const cornerSize = 6 * this.cellSize;
        
        this.ctx.fillStyle = colors.red;
        this.ctx.fillRect(9 * this.cellSize, 0, cornerSize, cornerSize);
        
        this.ctx.fillStyle = colors.blue;
        this.ctx.fillRect(0, 0, cornerSize, cornerSize);
        
        this.ctx.fillStyle = colors.green;
        this.ctx.fillRect(9 * this.cellSize, 9 * this.cellSize, cornerSize, cornerSize);
        
        this.ctx.fillStyle = colors.yellow;
        this.ctx.fillRect(0, 9 * this.cellSize, cornerSize, cornerSize);
        
        this.drawSquareBase(11.5 * this.cellSize, 2 * this.cellSize, 3 * this.cellSize, colors.red);
        this.drawSquareBase(1.5 * this.cellSize, 2 * this.cellSize, 3 * this.cellSize, colors.blue);
        this.drawSquareBase(11.5 * this.cellSize, 11 * this.cellSize, 3 * this.cellSize, colors.green);
        this.drawSquareBase(1.5 * this.cellSize, 11 * this.cellSize, 3 * this.cellSize, colors.yellow);
        
        this.drawPath();
        this.drawHomePaths();
        this.drawCenterArea();
        this.drawTokens();
    };
    
    game.drawSquareBase = function(x, y, size, color) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, y, size, size);
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, size, size);
        
        const tokenSize = size * 0.35;
        const gap = size * 0.15;
        const startX = x + gap;
        const startY = y + gap;
        
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const tx = startX + col * (tokenSize + gap);
                const ty = startY + row * (tokenSize + gap);
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(tx, ty, tokenSize, tokenSize);
                
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(tx, ty, tokenSize, tokenSize);
            }
        }
    };
    
    game.drawPath = function() {
        const pathPositions = BOARD_PATH;
        const startSquares = {0: 'red', 13: 'blue', 26: 'green', 39: 'yellow'};
        const arrowSquares = {
            1: 'down', 12: 'right', 14: 'down', 25: 'left', 
            27: 'down', 38: 'left', 40: 'up', 51: 'right'
        };
        const colors = {red: '#dc2626', blue: '#2563eb', green: '#16a34a', yellow: '#eab308'};
        
        pathPositions.forEach((pos, index) => {
            const x = pos.x * this.cellSize;
            const y = pos.y * this.cellSize;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            
            if (startSquares[index]) {
                this.drawArrow(x, y, this.cellSize, 'start', colors[startSquares[index]]);
            } else if (arrowSquares[index]) {
                this.drawArrow(x, y, this.cellSize, arrowSquares[index], '#000000');
            }
        });
    };
    
    game.drawArrow = function(x, y, size, direction, color) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        
        const cx = x + size / 2;
        const cy = y + size / 2;
        const arrowSize = size * 0.3;
        
        if (direction === 'start') {
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, arrowSize * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            return;
        }
        
        this.ctx.beginPath();
        if (direction === 'up') {
            this.ctx.moveTo(cx, cy - arrowSize);
            this.ctx.lineTo(cx - arrowSize * 0.5, cy);
            this.ctx.lineTo(cx + arrowSize * 0.5, cy);
        } else if (direction === 'down') {
            this.ctx.moveTo(cx, cy + arrowSize);
            this.ctx.lineTo(cx - arrowSize * 0.5, cy);
            this.ctx.lineTo(cx + arrowSize * 0.5, cy);
        } else if (direction === 'left') {
            this.ctx.moveTo(cx - arrowSize, cy);
            this.ctx.lineTo(cx, cy - arrowSize * 0.5);
            this.ctx.lineTo(cx, cy + arrowSize * 0.5);
        } else if (direction === 'right') {
            this.ctx.moveTo(cx + arrowSize, cy);
            this.ctx.lineTo(cx, cy - arrowSize * 0.5);
            this.ctx.lineTo(cx, cy + arrowSize * 0.5);
        }
        this.ctx.closePath();
        this.ctx.fill();
    };
    
    game.drawHomePaths = function() {
        const colors = {red: '#dc2626', blue: '#2563eb', green: '#16a34a', yellow: '#eab308'};
        
        Object.entries(HOME_PATHS).forEach(([color, positions]) => {
            positions.forEach((pos, index) => {
                const x = pos.x * this.cellSize;
                const y = pos.y * this.cellSize;
                
                this.ctx.fillStyle = colors[color];
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            });
        });
    };
    
    game.drawCenterArea = function() {
        const colors = {red: '#dc2626', blue: '#2563eb', green: '#16a34a', yellow: '#eab308'};
        const centerX = 7.5 * this.cellSize;
        const centerY = 7.5 * this.cellSize;
        const size = 1.5 * this.cellSize;
        
        this.ctx.fillStyle = colors.red;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX - size, centerY - size);
        this.ctx.lineTo(centerX + size, centerY - size);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = colors.blue;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX - size, centerY - size);
        this.ctx.lineTo(centerX - size, centerY + size);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = colors.yellow;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX - size, centerY + size);
        this.ctx.lineTo(centerX + size, centerY + size);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = colors.green;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + size, centerY - size);
        this.ctx.lineTo(centerX + size, centerY + size);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - size, centerY - size);
        this.ctx.lineTo(centerX + size, centerY - size);
        this.ctx.lineTo(centerX + size, centerY + size);
        this.ctx.lineTo(centerX - size, centerY + size);
        this.ctx.closePath();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - size, centerY - size);
        this.ctx.lineTo(centerX + size, centerY + size);
        this.ctx.moveTo(centerX + size, centerY - size);
        this.ctx.lineTo(centerX - size, centerY + size);
        this.ctx.stroke();
    };
}
