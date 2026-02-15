// ==========================================
// JUEGO: SALTADOR ESPACIAL
// Sistema completo con monetización
// ==========================================

class SpaceJumper {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Estado del juego
        this.state = 'start'; // start, playing, paused, reward, video, gameover
        this.score = 0;
        this.gems = parseInt(localStorage.getItem('spaceGems')) || 0;
        this.level = 1;
        
        // Jugador
        this.player = {
            x: this.width / 2,
            y: this.height - 150,
            width: 40,
            height: 40,
            velocityY: 0,
            velocityX: 0,
            jumping: false,
            color: '#4ecdc4',
            emoji: '🚀'
        };
        
        // Plataformas
        this.platforms = [];
        this.platformWidth = 80;
        this.platformHeight = 15;
        this.platformGap = 120;
        
        // Partículas
        this.particles = [];
        
        // Recompensas
        this.rewards = this.initializeRewards();
        this.nextRewardIndex = 0;
        this.lastRewardScore = 0;
        
        // Controles
        this.keys = {};
        this.touchX = null;
        
        // Bindings
        this.bindEvents();
        this.generateInitialPlatforms();
        this.updateUI();
        
        // Loop
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    initializeRewards() {
        return [
            {
                id: 1,
                scoreNeeded: 500,
                title: "🌟 Astronauta Novato",
                description: "¡Has completado tu primera misión espacial!",
                image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400",
                video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                unlocked: false
            },
            {
                id: 2,
                scoreNeeded: 1500,
                title: "🌙 Explorador Lunar",
                description: "Has alcanzado la órbita lunar. ¡Impresionante!",
                image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=400",
                video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                unlocked: false
            },
            {
                id: 3,
                scoreNeeded: 3000,
                title: "🪐 Conquistador de Marte",
                description: "El planeta rojo es tuyo. ¡Eres una leyenda!",
                image: "https://images.unsplash.com/photo-1614728853913-1e2a7a58dc61?w=400",
                video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                unlocked: false
            },
            {
                id: 4,
                scoreNeeded: 5000,
                title: "⭐ Maestro Galáctico",
                description: "Has dominado el espacio profundo. ¡Increíble!",
                image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400",
                video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                unlocked: false
            },
            {
                id: 5,
                scoreNeeded: 8000,
                title: "🌌 Dios del Universo",
                description: "Eres el ser más poderoso del cosmos.",
                image: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400",
                video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                unlocked: false
            }
        ];
    }
    
    generateInitialPlatforms() {
        this.platforms = [];
        // Plataforma inicial bajo el jugador
        this.platforms.push({
            x: this.width/2 - this.platformWidth/2,
            y: this.height - 100,
            width: this.platformWidth,
            height: this.platformHeight,
            type: 'normal',
            color: '#96ceb4'
        });
        
        // Generar plataformas hacia arriba
        for (let i = 1; i < 10; i++) {
            this.addPlatform(this.height - 100 - (i * this.platformGap));
        }
    }
    
    addPlatform(y) {
        const types = ['normal', 'moving', 'breakable'];
        const type = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'moving' : 'breakable') : 'normal';
        
        this.platforms.push({
            x: Math.random() * (this.width - this.platformWidth),
            y: y,
            width: this.platformWidth,
            height: this.platformHeight,
            type: type,
            color: type === 'normal' ? '#96ceb4' : type === 'moving' ? '#ffd700' : '#ff6b6b',
            velocityX: type === 'moving' ? (Math.random() > 0.5 ? 2 : -2) : 0,
            broken: false
        });
    }
    
    bindEvents() {
        // Teclado
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'ArrowLeft') this.player.velocityX = -8;
            if (e.key === 'ArrowRight') this.player.velocityX = 8;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') this.player.velocityX = 0;
        });
        
        // Táctil
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.velocityX = -8;
        });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.player.velocityX = 0;
        });
        
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.velocityX = 8;
        });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.player.velocityX = 0;
        });
        
        // Botones UI
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('continueBtn').addEventListener('click', () => this.continueGame());
        document.getElementById('watchAdBtn').addEventListener('click', () => this.showRewardedAd());
        document.getElementById('closeVideoBtn').addEventListener('click', () => this.closeVideo());
        document.getElementById('closeAdBtn').addEventListener('click', () => this.closeRewardedAd());
        document.getElementById('doubleRewardBtn').addEventListener('click', () => this.doubleRewards());
        
        // Resize
        window.addEventListener('resize', () => this.resize());
    }
    
    startGame() {
        this.state = 'playing';
        this.showScreen('gameScreen');
        
        // Log analytics
        if (window.analytics) {
            window.analytics.logEvent('game_start');
        }
    }
    
    restart() {
        this.score = 0;
        this.player.y = this.height - 150;
        this.player.velocityY = 0;
        this.player.velocityX = 0;
        this.generateInitialPlatforms();
        this.state = 'playing';
        this.showScreen('gameScreen');
        this.updateUI();
        
        if (window.analytics) {
            window.analytics.logEvent('game_restart');
        }
    }
    
    continueGame() {
        this.state = 'playing';
        this.showScreen('gameScreen');
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }
    
    update(dt) {
        if (this.state !== 'playing') return;
        
        // Física del jugador
        this.player.velocityY += 0.5; // Gravedad
        this.player.y += this.player.velocityY;
        this.player.x += this.player.velocityX;
        
        // Wrap horizontal
        if (this.player.x < 0) this.player.x = this.width;
        if (this.player.x > this.width) this.player.x = 0;
        
        // Colisión con plataformas (solo cuando cae)
        if (this.player.velocityY > 0) {
            this.platforms.forEach(platform => {
                if (
                    this.player.x + this.player.width/2 > platform.x &&
                    this.player.x - this.player.width/2 < platform.x + platform.width &&
                    this.player.y + this.player.height/2 > platform.y &&
                    this.player.y + this.player.height/2 < platform.y + platform.height + 10 &&
                    !platform.broken
                ) {
                    if (platform.type === 'breakable') {
                        platform.broken = true;
                        this.createParticles(platform.x + platform.width/2, platform.y, '#ff6b6b');
                    } else {
                        this.player.velocityY = -15;
                        this.createParticles(platform.x + platform.width/2, platform.y, '#fff');
                        
                        // Gemas por salto
                        this.gems += 1;
                        localStorage.setItem('spaceGems', this.gems);
                    }
                }
            });
        }
        
        // Movimiento de plataformas móviles
        this.platforms.forEach(p => {
            if (p.type === 'moving') {
                p.x += p.velocityX;
                if (p.x <= 0 || p.x + p.width >= this.width) {
                    p.velocityX *= -1;
                }
            }
        });
        
        // Scroll de cámara cuando el jugador sube
        if (this.player.y < this.height / 2) {
            const diff = (this.height / 2) - this.player.y;
            this.score += Math.floor(diff / 10);
            this.player.y = this.height / 2;
            
            // Mover plataformas hacia abajo
            this.platforms.forEach(p => {
                p.y += diff;
            });
            
            // Eliminar plataformas que salen de pantalla y añadir nuevas
            this.platforms = this.platforms.filter(p => p.y < this.height);
            while (this.platforms.length < 10) {
                const highestY = Math.min(...this.platforms.map(p => p.y));
                this.addPlatform(highestY - this.platformGap);
            }
        }
        
        // Game over si cae
        if (this.player.y > this.height) {
            this.gameOver();
        }
        
        // Actualizar partículas
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            return p.life > 0;
        });
        
        // Verificar recompensas
        this.checkRewards();
        
        // Actualizar UI
        this.updateUI();
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: color
            });
        }
    }
    
    checkRewards() {
        const nextReward = this.rewards[this.nextRewardIndex];
        if (nextReward && this.score >= nextReward.scoreNeeded && !nextReward.unlocked) {
            nextReward.unlocked = true;
            this.lastRewardScore = this.score;
            this.showRewardImage(nextReward);
            
            // Analytics
            if (window.analytics) {
                window.analytics.logEvent('reward_unlocked', {
                    reward_id: nextReward.id,
                    reward_title: nextReward.title
                });
            }
        }
    }
    
    showRewardImage(reward) {
        this.state = 'reward';
        
        // Configurar modal de imagen
        document.getElementById('rewardImage').src = reward.image;
        document.getElementById('rewardTitle').textContent = reward.title;
        document.getElementById('rewardDesc').textContent = reward.description;
        
        // Guardar referencia a recompensa actual para el video
        this.currentReward = reward;
        
        this.showScreen('rewardImageScreen');
        
        // Auto-incrementar índice para siguiente recompensa
        this.nextRewardIndex++;
    }
    
    showRewardedAd() {
        // Mostrar modal de anuncio
        const modal = document.getElementById('rewardedAdModal');
        modal.classList.add('active');
        
        let countdown = 5;
        const timerEl = document.getElementById('adTimer');
        const countdownEl = document.getElementById('countdown');
        const closeBtn = document.getElementById('closeAdBtn');
        
        closeBtn.disabled = true;
        
        const interval = setInterval(() => {
            countdown--;
            timerEl.textContent = countdown + 's';
            countdownEl.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(interval);
                closeBtn.disabled = false;
                closeBtn.textContent = 'Cerrar Anuncio y Reclamar Recompensa';
            }
        }, 1000);
        
        // Analytics
        if (window.analytics) {
            window.analytics.logEvent('ad_started', { type: 'rewarded' });
        }
    }
    
    closeRewardedAd() {
        document.getElementById('rewardedAdModal').classList.remove('active');
        
        // Mostrar video de recompensa
        this.showRewardVideo();
        
        // Bonus de gemas
        this.gems += 100;
        localStorage.setItem('spaceGems', this.gems);
        
        if (window.analytics) {
            window.analytics.logEvent('ad_completed', { type: 'rewarded' });
        }
    }
    
    showRewardVideo() {
        const reward = this.currentReward;
        const video = document.getElementById('rewardVideo');
        const overlay = document.getElementById('videoOverlay');
        
        video.src = reward.video;
        document.getElementById('videoTitle').textContent = reward.title;
        
        this.showScreen('rewardVideoScreen');
        
        // Quitar overlay después de un momento
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 2000);
        
        // Analytics
        if (window.analytics) {
            window.analytics.logEvent('video_unlocked', {
                reward_id: reward.id
            });
        }
    }
    
    closeVideo() {
        const video = document.getElementById('rewardVideo');
        video.pause();
        video.src = '';
        this.continueGame();
    }
    
    doubleRewards() {
        // Similar a showRewardedAd pero duplica gemas
        this.showRewardedAd();
        // Lógica adicional para doblar recompensas...
    }
    
    gameOver() {
        this.state = 'gameover';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalGems').textContent = this.gems;
        this.showScreen('gameOverScreen');
        
        if (window.analytics) {
            window.analytics.logEvent('game_over', {
                score: this.score,
                level: this.level
            });
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = Math.floor(this.score / 1000) + 1;
        
        const nextReward = this.rewards[this.nextRewardIndex];
        if (nextReward) {
            const remaining = Math.max(0, nextReward.scoreNeeded - this.score);
            document.getElementById('nextRewardDist').textContent = remaining;
        } else {
            document.getElementById('nextRewardDist').textContent = 'MAX';
        }
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = 'rgba(15, 12, 41, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Dibujar plataformas
        this.platforms.forEach(p => {
            if (p.broken) return;
            
            // Sombra
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fillRect(p.x + 5, p.y + 5, p.width, p.height);
            
            // Plataforma
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
            
            // Brillo
            this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
            this.ctx.fillRect(p.x, p.y, p.width, 3);
        });
        
        // Dibujar partículas
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
        
        // Dibujar jugador
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Sombra del jugador
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.fillText(this.player.emoji, this.player.x + 3, this.player.y + 3);
        
        // Jugador
        this.ctx.fillText(this.player.emoji, this.player.x, this.player.y);
        
        // Propulsor si está saltando
        if (this.player.velocityY < 0) {
            this.ctx.font = '20px Arial';
            this.ctx.fillText('🔥', this.player.x, this.player.y + 30);
        }
    }
    
    animate(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(dt);
        this.draw();
        
        requestAnimationFrame(this.animate);
    }
}

// Iniciar juego cuando cargue la página
window.addEventListener('load', () => {
    window.game = new SpaceJumper();
});
