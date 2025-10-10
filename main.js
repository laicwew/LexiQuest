// LexiQuest - Main Game Logic
class LexiQuest {
    constructor() {
        this.gameState = {
            character: {
                name: 'Adventurer',
                level: 1,
                hp: 100,
                maxHp: 100,
                energy: 50,
                maxEnergy: 50,
                experience: 0,
                maxExperience: 100
            },
            currentModule: {
                id: 'supermarket_v1',
                title: 'Magical Market',
                description: 'Learn shopping vocabulary',
                progress: 25
            },
            story: {
                currentScene: 'entrance',
                text: '',
                history: []
            },
            vocabulary: {
                learned: new Map(),
                selectedWord: null,
                dictionary: []
            },
            progress: {
                wordsLearnedToday: 0,
                timeSpent: 0,
                actionsTaken: 0,
                achievements: []
            },
            settings: {
                nativeLanguage: 'zh',
                targetLanguage: 'en',
                difficulty: 'normal',
                soundEnabled: true,
                animationsEnabled: true
            }
        };
        
        this.modules = {
            supermarket_v1: {
                title: 'Magical Market',
                description: 'Learn shopping vocabulary in a mystical supermarket',
                scenes: {
                    entrance: {
                        text: '你走进魔法超市，看到一个红色的apple放在shelf上。一个友好的clerk正在cleaning地面。明亮的灯光照亮了各种fruits和vegetables，它们被整齐地排列在架子上。',
                        vocabulary: [
                            { word: 'apple', translation: '苹果', pos: 'noun', difficulty: 1 },
                            { word: 'shelf', translation: '架子', pos: 'noun', difficulty: 2 },
                            { word: 'clerk', translation: '店员', pos: 'noun', difficulty: 2 },
                            { word: 'cleaning', translation: '打扫', pos: 'verb', difficulty: 2 },
                            { word: 'bright', translation: '明亮的', pos: 'adjective', difficulty: 2 },
                            { word: 'fruits', translation: '水果', pos: 'noun', difficulty: 1 },
                            { word: 'vegetables', translation: '蔬菜', pos: 'noun', difficulty: 1 }
                        ],
                        interactions: ['talk_to_clerk', 'examine_shelf', 'explore_aisle']
                    }
                },
                npcs: {
                    clerk: {
                        name: 'Shopkeeper',
                        dialogue: [
                            'Welcome to our magical market!',
                            'Feel free to browse our fresh produce.',
                            'Would you like to try our special apples?'
                        ]
                    }
                }
            }
        };
        
        this.actionResponses = {
            eat: {
                apple: '你咬了一口脆甜的apple。味道很棒！你的能量增加了5点。',
                bread: '你吃着新鲜的bread。它让你感到温暖，恢复了10点生命值。',
                default: '你吃掉了这个物品。味道不错，恢复了一些能量。'
            },
            attack: {
                apple: '你攻击了apple！它无害地滚开了。clerk奇怪地看着你。',
                clerk: '你试图攻击友好的clerk。他们后退了一步，对你的攻击感到困惑。',
                default: '你攻击了目标。没发生什么特别的事情，但你感到有点傻。'
            },
            talk: {
                clerk: 'clerk微笑着说："欢迎！我们的apple都是从魔法果园新鲜采摘的。"',
                apple: '你试图和apple说话。它没有回应，但你感到与大自然有一种奇怪的联系。',
                default: '你对目标说话。他们似乎理解了你的意图。'
            },
            imitate: {
                apple: '你小心地发音"apple"。这个词在你舌头上感觉很自然。你学到了一个新词！',
                cleaning: '你练习说"cleaning"。复杂的音节完美地从你舌尖滚落。',
                default: '你模仿了这个词。你的发音随着每次尝试都在进步。'
            }
        };
        
        this.achievements = [
            { id: 'first_word', name: '第一步', description: '学会第一个词汇', unlocked: false },
            { id: 'five_words', name: '词汇增长', description: '学会5个新词汇', unlocked: false },
            { id: 'first_action', name: '采取行动', description: '执行第一个动作', unlocked: false },
            { id: 'explorer', name: '探险家', description: '尝试所有四种动作类型', unlocked: false },
            { id: 'persistent', name: '坚持学习者', description: '游戏15分钟', unlocked: false }
        ];
        
        this.init();
    }
    
    init() {
        this.loadGameState();
        this.setupEventListeners();
        this.initializeParticles();
        this.updateUI();
        this.startStory();
        this.startProgressTracking();
    }
    
    loadGameState() {
        const savedState = localStorage.getItem('lexiquest-save');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            this.gameState = { ...this.gameState, ...parsed };
            
            // Restore Map objects
            if (parsed.vocabulary && parsed.vocabulary.learned) {
                this.gameState.vocabulary.learned = new Map(parsed.vocabulary.learned);
            }
        }
        
        // Load username from localStorage
        const username = localStorage.getItem('lexiquest-username');
        if (username) {
            document.getElementById('username-display').textContent = username;
            this.gameState.character.name = username;
        }
    }
    
    saveGameState() {
        const stateToSave = {
            ...this.gameState,
            vocabulary: {
                ...this.gameState.vocabulary,
                learned: Array.from(this.gameState.vocabulary.learned.entries())
            }
        };
        localStorage.setItem('lexiquest-save', JSON.stringify(stateToSave));
    }
    
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveGameState();
                        this.showNotification('Game saved!', 'success');
                        break;
                    case 'd':
                        e.preventDefault();
                        toggleDictionary();
                        break;
                }
            }
            
            // Number keys for actions
            if (!isNaN(e.key) && e.key >= '1' && e.key <= '4') {
                const actions = ['eat', 'attack', 'talk', 'imitate'];
                const actionIndex = parseInt(e.key) - 1;
                if (actionIndex < actions.length && this.gameState.vocabulary.selectedWord) {
                    this.performAction(actions[actionIndex]);
                }
            }
        });
    }
    
    initializeParticles() {
        // P5.js particle system for magical background
        new p5((p) => {
            let particles = [];
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.id('particles-canvas');
                canvas.parent('particles-canvas');
                
                // Create initial particles
                for (let i = 0; i < 50; i++) {
                    particles.push(new Particle(p));
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw particles
                for (let i = particles.length - 1; i >= 0; i--) {
                    particles[i].update();
                    particles[i].display();
                    
                    if (particles[i].isDead()) {
                        particles.splice(i, 1);
                    }
                }
                
                // Add new particles occasionally
                if (particles.length < 50 && p.random() < 0.1) {
                    particles.push(new Particle(p));
                }
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
            
            class Particle {
                constructor(p) {
                    this.p = p;
                    this.x = p.random(p.width);
                    this.y = p.height + 10;
                    this.vx = p.random(-0.5, 0.5);
                    this.vy = p.random(-2, -0.5);
                    this.life = 255;
                    this.decay = p.random(0.5, 2);
                    this.size = p.random(2, 6);
                    this.symbol = p.random(['✦', '✧', '✨', '✦', '✧']);
                }
                
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.life -= this.decay;
                    
                    // Gentle floating motion
                    this.vx += this.p.random(-0.1, 0.1);
                    this.vy += this.p.random(-0.05, 0.05);
                }
                
                display() {
                    this.p.push();
                    this.p.translate(this.x, this.y);
                    this.p.fill(212, 175, 55, this.life);
                    this.p.noStroke();
                    this.p.textAlign(this.p.CENTER, this.p.CENTER);
                    this.p.textSize(this.size);
                    this.p.text(this.symbol, 0, 0);
                    this.p.pop();
                }
                
                isDead() {
                    return this.life <= 0;
                }
            }
        });
    }
    
    startStory() {
        const currentModule = this.modules[this.gameState.currentModule.id];
        const currentScene = currentModule.scenes[this.gameState.story.currentScene];
        
        this.displayStory(currentScene.text, currentScene.vocabulary);
    }
    
    displayStory(text, vocabulary) {
        const storyContent = document.getElementById('story-content');
        
        // Process text to highlight vocabulary words
        let processedText = text;
        vocabulary.forEach(word => {
            const regex = new RegExp(`\\b${word.word}\\b`, 'gi');
            processedText = processedText.replace(regex, `<span class="interactive-word" data-word="${word.word}" onclick="game.selectWord('${word.word}')">${word.word}</span>`);
        });
        
        // Clear previous content
        storyContent.innerHTML = '';
        
        // Typewriter effect for story text
        const typed = new Typed('#story-content', {
            strings: [processedText],
            typeSpeed: 30,
            showCursor: false,
            onComplete: () => {
                this.setupWordInteractions();
            }
        });
        
        // Store current vocabulary for interactions
        this.currentVocabulary = vocabulary;
    }
    
    setupWordInteractions() {
        const words = document.querySelectorAll('.interactive-word');
        words.forEach(word => {
            word.addEventListener('click', (e) => {
                const wordText = e.target.dataset.word;
                this.selectWord(wordText);
            });
        });
    }
    
    selectWord(word) {
        // Remove previous selection
        document.querySelectorAll('.interactive-word').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Select new word
        const wordElement = document.querySelector(`[data-word="${word}"]`);
        if (wordElement) {
            wordElement.classList.add('selected');
            this.gameState.vocabulary.selectedWord = word;
            this.enableActionButtons();
            
            // Animate selection
            anime({
                targets: wordElement,
                scale: [1, 1.1, 1],
                duration: 300,
                easing: 'easeOutElastic(1, .8)'
            });
        }
    }
    
    enableActionButtons() {
        const buttons = ['eat-btn', 'attack-btn', 'talk-btn', 'imitate-btn'];
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            button.disabled = false;
            
            // Animate button activation
            anime({
                targets: button,
                scale: [0.95, 1],
                opacity: [0.7, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    }
    
    disableActionButtons() {
        const buttons = ['eat-btn', 'attack-btn', 'talk-btn', 'imitate-btn'];
        buttons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            button.disabled = true;
        });
    }
    
    performAction(action) {
        const selectedWord = this.gameState.vocabulary.selectedWord;
        if (!selectedWord) return;
        
        this.gameState.progress.actionsTaken++;
        
        // Get appropriate response
        let response = this.actionResponses[action][selectedWord] || this.actionResponses[action].default;
        
        // Handle special cases
        if (action === 'imitate') {
            this.learnWord(selectedWord);
        }
        
        // Update character stats based on action
        this.updateCharacterStats(action);
        
        // Display response
        this.displayActionResponse(response);
        
        // Disable buttons after action
        this.disableActionButtons();
        
        // Clear word selection
        document.querySelectorAll('.interactive-word').forEach(el => {
            el.classList.remove('selected');
        });
        this.gameState.vocabulary.selectedWord = null;
        
        // Check for achievements
        this.checkAchievements();
        
        // Save game state
        this.saveGameState();
    }
    
    updateCharacterStats(action) {
        switch(action) {
            case 'eat':
                this.gameState.character.energy = Math.min(100, this.gameState.character.energy + 5);
                this.gameState.character.experience += 2;
                break;
            case 'attack':
                this.gameState.character.energy = Math.max(0, this.gameState.character.energy - 2);
                this.gameState.character.experience += 1;
                break;
            case 'talk':
                this.gameState.character.experience += 3;
                break;
            case 'imitate':
                this.gameState.character.experience += 5;
                break;
        }
        
        // Check for level up
        if (this.gameState.character.experience >= this.gameState.character.maxExperience) {
            this.levelUp();
        }
        
        this.updateCharacterUI();
    }
    
    levelUp() {
        this.gameState.character.level++;
        this.gameState.character.experience = 0;
        this.gameState.character.maxExperience += 50;
        this.gameState.character.maxHp += 20;
        this.gameState.character.hp = this.gameState.character.maxHp;
        this.gameState.character.maxEnergy += 10;
        this.gameState.character.energy = this.gameState.character.maxEnergy;
        
        this.showNotification(`Level up! You are now level ${this.gameState.character.level}!`, 'achievement');
        
        // Animate level up
        anime({
            targets: '#character-level',
            scale: [1, 1.5, 1],
            color: ['#D4AF37', '#FFD700', '#D4AF37'],
            duration: 1000,
            easing: 'easeOutElastic(1, .8)'
        });
    }
    
    learnWord(word) {
        const vocabulary = this.currentVocabulary.find(v => v.word === word);
        if (vocabulary && !this.gameState.vocabulary.learned.has(word)) {
            this.gameState.vocabulary.learned.set(word, {
                ...vocabulary,
                learnedAt: Date.now(),
                reviewCount: 0,
                mastery: 0
            });
            
            this.gameState.progress.wordsLearnedToday++;
            this.updateVocabularyCount();
            
            this.showNotification(`New word learned: ${word} (${vocabulary.translation})`, 'success');
            
            // Animate vocabulary count
            anime({
                targets: '#vocab-count',
                scale: [1, 1.3, 1],
                color: ['#D4AF37', '#FFD700', '#D4AF37'],
                duration: 500,
                easing: 'easeOutElastic(1, .8)'
            });
        }
    }
    
    displayActionResponse(response) {
        const storyContent = document.getElementById('story-content');
        
        // Add response to story
        const responseElement = document.createElement('div');
        responseElement.className = 'mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg';
        responseElement.innerHTML = `<p class="italic text-blue-800">${response}</p>`;
        
        storyContent.appendChild(responseElement);
        
        // Animate response appearance
        anime({
            targets: responseElement,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });
        
        // Scroll to response
        responseElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    generateActionPrompt() {
        const prompts = [
            '你想深入探索市场吗？',
            '店员似乎还有更多话要说。你要不要再和他谈谈？',
            '你注意到远处的架子上有闪闪发光的东西。要调查一下吗？',
            '魔法的氛围让你感到好奇。要多看看周围吗？',
            '你想练习更多词汇。要试试另一个词吗？'
        ];
        
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        
        const promptElement = document.getElementById('action-prompt');
        const promptText = document.getElementById('prompt-text');
        
        promptText.textContent = randomPrompt;
        promptElement.classList.remove('hidden');
        
        // Hide action prompt button
        document.getElementById('action-prompt-btn').style.display = 'none';
        
        // Animate prompt appearance
        anime({
            targets: promptElement,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });
    }
    
    handleActionPrompt(choice) {
        const promptElement = document.getElementById('action-prompt');
        
        switch(choice) {
            case 'yes':
                this.continueStory();
                break;
            case 'retry':
                this.generateActionPrompt();
                return;
            case 'no':
                // Do nothing, just hide prompt
                break;
        }
        
        // Hide prompt and show button again
        promptElement.classList.add('hidden');
        document.getElementById('action-prompt-btn').style.display = 'inline-block';
    }
    
    continueStory() {
        const continuationText = '你决定进一步探索。魔法市场似乎隐藏着许多秘密和学习机会...';
        
        this.displayActionResponse(continuationText);
        
        // Add some experience for exploring
        this.gameState.character.experience += 3;
        this.updateCharacterUI();
    }
    
    updateUI() {
        this.updateCharacterUI();
        this.updateVocabularyCount();
        this.updateModuleProgress();
        this.updateTodayStats();
    }
    
    updateCharacterUI() {
        document.getElementById('character-name').textContent = this.gameState.character.name;
        document.getElementById('character-level').textContent = this.gameState.character.level;
        
        // Update HP
        const hpPercent = (this.gameState.character.hp / this.gameState.character.maxHp) * 100;
        document.getElementById('hp-display').textContent = `${this.gameState.character.hp}/${this.gameState.character.maxHp}`;
        document.getElementById('hp-bar').style.width = `${hpPercent}%`;
        
        // Update Energy
        const energyPercent = (this.gameState.character.energy / this.gameState.character.maxEnergy) * 100;
        document.getElementById('energy-display').textContent = `${this.gameState.character.energy}/${this.gameState.character.maxEnergy}`;
        document.getElementById('energy-bar').style.width = `${energyPercent}%`;
        
        // Update XP
        const xpPercent = (this.gameState.character.experience / this.gameState.character.maxExperience) * 100;
        document.getElementById('xp-display').textContent = `${this.gameState.character.experience}/${this.gameState.character.maxExperience}`;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;
    }
    
    updateVocabularyCount() {
        const count = this.gameState.vocabulary.learned.size;
        document.getElementById('vocab-count').textContent = count;
        document.getElementById('today-words').textContent = this.gameState.progress.wordsLearnedToday;
    }
    
    updateModuleProgress() {
        const progress = this.gameState.currentModule.progress;
        document.getElementById('module-progress').style.width = `${progress}%`;
    }
    
    updateTodayStats() {
        document.getElementById('today-words').textContent = this.gameState.progress.wordsLearnedToday;
        document.getElementById('today-actions').textContent = this.gameState.progress.actionsTaken;
        
        const minutes = Math.floor(this.gameState.progress.timeSpent / 60);
        document.getElementById('today-time').textContent = `${minutes} min`;
    }
    
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked) {
                let shouldUnlock = false;
                
                switch(achievement.id) {
                    case 'first_word':
                        shouldUnlock = this.gameState.vocabulary.learned.size >= 1;
                        break;
                    case 'five_words':
                        shouldUnlock = this.gameState.vocabulary.learned.size >= 5;
                        break;
                    case 'first_action':
                        shouldUnlock = this.gameState.progress.actionsTaken >= 1;
                        break;
                    case 'explorer':
                        shouldUnlock = this.gameState.progress.actionsTaken >= 4;
                        break;
                    case 'persistent':
                        shouldUnlock = this.gameState.progress.timeSpent >= 900; // 15 minutes
                        break;
                }
                
                if (shouldUnlock) {
                    achievement.unlocked = true;
                    this.unlockAchievement(achievement);
                }
            }
        });
    }
    
    unlockAchievement(achievement) {
        this.showAchievement(achievement);
        this.gameState.progress.achievements.push(achievement.id);
        
        // Add to achievements list
        const achievementsList = document.getElementById('achievements-list');
        const achievementElement = document.createElement('div');
        achievementElement.className = 'flex items-center space-x-2 text-sm';
        achievementElement.innerHTML = `
            <span class="text-yellow-500">🏆</span>
            <span class="font-medium">${achievement.name}</span>
        `;
        achievementsList.appendChild(achievementElement);
        
        // Animate achievement
        anime({
            targets: achievementElement,
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 500,
            easing: 'easeOutQuad'
        });
    }
    
    showAchievement(achievement) {
        const notification = document.getElementById('achievement-notification');
        const text = document.getElementById('achievement-text');
        
        text.textContent = achievement.description;
        notification.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
    
    showNotification(message, type = 'info') {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'achievement' ? 'bg-yellow-500 text-black' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            opacity: [0, 1],
            translateX: [100, 0],
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        // Auto-remove
        setTimeout(() => {
            anime({
                targets: notification,
                opacity: [1, 0],
                translateX: [0, 100],
                duration: 300,
                easing: 'easeOutQuad',
                complete: () => {
                    document.body.removeChild(notification);
                }
            });
        }, 3000);
    }
    
    startProgressTracking() {
        // Track time spent in game
        setInterval(() => {
            this.gameState.progress.timeSpent++;
            this.updateTodayStats();
            this.checkAchievements();
        }, 1000);
    }
    
    toggleDictionary() {
        const modal = document.getElementById('dictionary-modal');
        const isVisible = !modal.classList.contains('hidden');
        
        if (isVisible) {
            modal.classList.add('hidden');
        } else {
            modal.classList.remove('hidden');
            this.updateDictionaryContent();
        }
    }
    
    updateDictionaryContent() {
        const content = document.getElementById('dictionary-content');
        content.innerHTML = '';
        
        if (this.gameState.vocabulary.learned.size === 0) {
            content.innerHTML = '<p class="text-gray-500 text-center">No words learned yet. Start playing to build your vocabulary!</p>';
            return;
        }
        
        this.gameState.vocabulary.learned.forEach((wordData, word) => {
            const card = document.createElement('div');
            card.className = 'dictionary-card';
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold text-lg">${word}</h4>
                        <p class="text-gray-600 chinese-text">${wordData.translation}</p>
                        <p class="text-sm text-gray-500 capitalize">${wordData.pos}</p>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-400">Mastery</div>
                        <div class="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div class="bg-yellow-500 h-2 rounded-full" style="width: ${wordData.mastery}%"></div>
                        </div>
                    </div>
                </div>
            `;
            content.appendChild(card);
        });
    }
    
    filterDictionary() {
        const searchTerm = document.getElementById('dictionary-search').value.toLowerCase();
        const cards = document.querySelectorAll('.dictionary-card');
        
        cards.forEach(card => {
            const word = card.querySelector('h4').textContent.toLowerCase();
            const translation = card.querySelector('.chinese-text').textContent.toLowerCase();
            
            if (word.includes(searchTerm) || translation.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    saveGame() {
        this.saveGameState();
        this.showNotification('Game saved successfully!', 'success');
    }
}

// Global functions for HTML event handlers
let game;

function toggleDictionary() {
    game.toggleDictionary();
}

function saveGame() {
    game.saveGame();
}

function performAction(action) {
    game.performAction(action);
}

function generateActionPrompt() {
    game.generateActionPrompt();
}

function handleActionPrompt(choice) {
    game.handleActionPrompt(choice);
}

function filterDictionary() {
    game.filterDictionary();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new LexiQuest();
});