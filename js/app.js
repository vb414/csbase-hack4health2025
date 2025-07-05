// MindfulMe - Complete Mental Health Companion

// Data Management
class MindfulMeApp {
    constructor() {
        this.data = this.loadData();
        this.currentMood = null;
        this.selectedFactors = [];
        this.currentTags = [];
        this.breathingInterval = null;
        this.breathingTimer = null;
        this.sessionStartTime = null;
        this.sessionTimer = null;
        this.isPaused = false;
        this.cycleCount = 0;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.achievements = this.initAchievements();
        this.init();
    }

    // Initialize achievements
    initAchievements() {
        return {
            firstMood: { id: 'firstMood', name: 'First Step', description: 'Track your first mood', icon: '🌱', unlocked: false },
            weekStreak: { id: 'weekStreak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', unlocked: false },
            tenMoods: { id: 'tenMoods', name: 'Mood Master', description: 'Track 10 moods', icon: '📊', unlocked: false },
            firstJournal: { id: 'firstJournal', name: 'Dear Diary', description: 'Write your first journal entry', icon: '📝', unlocked: false },
            breathingPro: { id: 'breathingPro', name: 'Breathing Pro', description: 'Complete 5 breathing sessions', icon: '🌬️', unlocked: false },
            earlyBird: { id: 'earlyBird', name: 'Early Bird', description: 'Track mood before 9 AM', icon: '🌅', unlocked: false },
            nightOwl: { id: 'nightOwl', name: 'Night Owl', description: 'Track mood after 9 PM', icon: '🌙', unlocked: false },
            moodExplorer: { id: 'moodExplorer', name: 'Mood Explorer', description: 'Use all 5 mood options', icon: '🎭', unlocked: false },
            consistentUser: { id: 'consistentUser', name: 'Consistent User', description: 'Use app 3 days in a row', icon: '⭐', unlocked: false },
            zenMaster: { id: 'zenMaster', name: 'Zen Master', description: '30 minutes of breathing exercises', icon: '🧘', unlocked: false },
            puzzleSolver: { id: 'puzzleSolver', name: 'Puzzle Solver', description: 'Complete your first puzzle', icon: '🧩', unlocked: false }
        };
    }

    // Initialize app
    init() {
        this.loadAchievements();
        this.updateStats();
        this.updateDateTime();
        this.loadJournalPrompt();
        this.loadRecentEntries();
        this.checkDailyStreak();
        this.displayAchievements();
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
        
        // Auto-save every 5 minutes
        setInterval(() => this.saveData(), 300000);
    }

    // Load data from localStorage
    loadData() {
        const savedData = localStorage.getItem('mindfulme_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            // Convert array back to Set for usedMoodValues
            if (data.usedMoodValues && Array.isArray(data.usedMoodValues)) {
                data.usedMoodValues = new Set(data.usedMoodValues);
            }
            return data;
        }
        return {
            moods: [],
            journals: [],
            breathingSessions: [],
            lastVisit: new Date().toDateString(),
            streak: 1,
            usedMoodValues: new Set(),
            puzzlesCompleted: 0,
            preferences: {
                reminderTime: null,
                theme: 'dark'
            }
        };
    }

    // Load achievements
    loadAchievements() {
        const saved = localStorage.getItem('mindfulme_achievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            Object.keys(savedAchievements).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = savedAchievements[key].unlocked;
                }
            });
        }
    }

    // Save achievements
    saveAchievements() {
        localStorage.setItem('mindfulme_achievements', JSON.stringify(this.achievements));
    }

    // Check and unlock achievements
    checkAchievements() {
        let newUnlock = false;

        // First mood
        if (this.data.moods.length >= 1 && !this.achievements.firstMood.unlocked) {
            this.achievements.firstMood.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.firstMood);
        }

        // Ten moods
        if (this.data.moods.length >= 10 && !this.achievements.tenMoods.unlocked) {
            this.achievements.tenMoods.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.tenMoods);
        }

        // Week streak
        if (this.data.streak >= 7 && !this.achievements.weekStreak.unlocked) {
            this.achievements.weekStreak.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.weekStreak);
        }

        // First journal
        if (this.data.journals.length >= 1 && !this.achievements.firstJournal.unlocked) {
            this.achievements.firstJournal.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.firstJournal);
        }

        // Breathing pro
        if (this.data.breathingSessions.length >= 5 && !this.achievements.breathingPro.unlocked) {
            this.achievements.breathingPro.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.breathingPro);
        }

        // Zen master (30 minutes breathing)
        const totalBreathingTime = this.data.breathingSessions.reduce((sum, session) => sum + session.duration, 0);
        if (totalBreathingTime >= 1800 && !this.achievements.zenMaster.unlocked) {
            this.achievements.zenMaster.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.zenMaster);
        }

        // Mood explorer
        if (this.data.usedMoodValues && this.data.usedMoodValues.size >= 5 && !this.achievements.moodExplorer.unlocked) {
            this.achievements.moodExplorer.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.moodExplorer);
        }

        // Consistent user (3 days in a row)
        if (this.data.streak >= 3 && !this.achievements.consistentUser.unlocked) {
            this.achievements.consistentUser.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.consistentUser);
        }

        // Puzzle solver
        if (this.data.puzzlesCompleted >= 1 && !this.achievements.puzzleSolver.unlocked) {
            this.achievements.puzzleSolver.unlocked = true;
            newUnlock = true;
            this.showAchievement(this.achievements.puzzleSolver);
        }

        if (newUnlock) {
            this.saveAchievements();
            this.displayAchievements();
        }
    }

    // Show achievement notification
    showAchievement(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Display achievements in home
    displayAchievements() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;

        const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        const totalCount = Object.values(this.achievements).length;

        container.innerHTML = `
            <h3>🏆 Achievements (${unlockedCount}/${totalCount})</h3>
            <div class="achievements-grid">
                ${Object.values(this.achievements).map(achievement => `
                    <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}" 
                         title="${achievement.description}">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-name">${achievement.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Save data to localStorage
    saveData() {
        // Convert Set to Array for storage
        const dataToSave = { ...this.data };
        if (this.data.usedMoodValues instanceof Set) {
            dataToSave.usedMoodValues = Array.from(this.data.usedMoodValues);
        }
        localStorage.setItem('mindfulme_data', JSON.stringify(dataToSave));
    }

    // Update date/time display
    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const dateTimeStr = now.toLocaleDateString('en-US', options);
        
        const moodCheckTime = document.getElementById('moodCheckTime');
        if (moodCheckTime) {
            moodCheckTime.textContent = dateTimeStr;
        }
    }

    // Check and update daily streak
    checkDailyStreak() {
        const today = new Date().toDateString();
        const lastVisit = new Date(this.data.lastVisit);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate - lastVisit) / (1000 * 60 * 60 * 24));
        
        if (this.data.lastVisit !== today) {
            if (daysDiff === 1) {
                this.data.streak++;
            } else if (daysDiff > 1) {
                this.data.streak = 1;
            }
            this.data.lastVisit = today;
            this.saveData();
        }
    }

    // Update statistics
    updateStats() {
        // Streak
        document.getElementById('streakDays').textContent = this.data.streak;
        
        // Total entries
        const totalEntries = this.data.moods.length + this.data.journals.length;
        document.getElementById('totalEntries').textContent = totalEntries;
        
        // Average mood
        if (this.data.moods.length > 0) {
            const avgMoodValue = this.data.moods.reduce((sum, mood) => sum + mood.value, 0) / this.data.moods.length;
            const moodEmojis = ['😢', '😟', '😐', '🙂', '😊'];
            document.getElementById('avgMood').textContent = moodEmojis[Math.round(avgMoodValue) - 1];
            
            // Current mood (today's last mood)
            const todayMoods = this.data.moods.filter(mood => {
                const moodDate = new Date(mood.date).toDateString();
                return moodDate === new Date().toDateString();
            });
            if (todayMoods.length > 0) {
                document.getElementById('currentMoodEmoji').textContent = todayMoods[todayMoods.length - 1].emoji;
            }
        }
        
        // Mindful minutes - Fixed calculation
        const totalMinutes = this.data.breathingSessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
        document.getElementById('mindfulMinutes').textContent = totalMinutes;
        
        // Weekly check-ins
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyCheckIns = this.data.breathingSessions.filter(session => new Date(session.date) >= weekAgo).length;
        document.getElementById('weeklyCheckIns').textContent = weeklyCheckIns;
    }

    // Mood tracking methods
    selectMood(value) {
        this.currentMood = value;
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.closest('.mood-btn').classList.add('selected');
        
        // Show factors section
        document.querySelector('.mood-factors').style.display = 'block';
    }

    // Toggle mood factor
    toggleFactor(factor) {
        const index = this.selectedFactors.indexOf(factor);
        if (index > -1) {
            this.selectedFactors.splice(index, 1);
        } else {
            this.selectedFactors.push(factor);
        }
        
        // Update UI
        event.target.classList.toggle('selected');
    }

    // Save mood
    saveMood() {
        if (!this.currentMood) {
            alert('Please select a mood first');
            return;
        }
        
        const moodNote = document.getElementById('moodNote').value;
        const moodEmojis = ['😢', '😟', '😐', '🙂', '😊'];
        
        const moodEntry = {
            value: this.currentMood,
            emoji: moodEmojis[this.currentMood - 1],
            factors: [...this.selectedFactors],
            note: moodNote,
            date: new Date().toISOString()
        };
        
        this.data.moods.push(moodEntry);
        
        // Track used mood values
        if (!this.data.usedMoodValues) {
            this.data.usedMoodValues = new Set();
        }
        this.data.usedMoodValues.add(this.currentMood);
        
        // Check time-based achievements
        const hour = new Date().getHours();
        if (hour < 9 && !this.achievements.earlyBird.unlocked) {
            this.achievements.earlyBird.unlocked = true;
            this.showAchievement(this.achievements.earlyBird);
        }
        if (hour >= 21 && !this.achievements.nightOwl.unlocked) {
            this.achievements.nightOwl.unlocked = true;
            this.showAchievement(this.achievements.nightOwl);
        }
        
        this.saveData();
        this.updateStats();
        this.checkAchievements();
        
        // Reset form
        this.currentMood = null;
        this.selectedFactors = [];
        document.getElementById('moodNote').value = '';
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.factor-chip').forEach(chip => chip.classList.remove('selected'));
        document.querySelector('.mood-factors').style.display = 'none';
        
        // Show success message
        const saveBtn = document.querySelector('.save-mood-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Mood Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
            // Go back to home page after saving
            showPage('home');
        }, 1500);
    }

    // Breathing exercise methods
    startBreathing(technique) {
        const techniques = {
            '478': { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 Breathing' },
            'box': { inhale: 4, hold: 4, exhale: 4, name: 'Box Breathing' },
            'calm': { inhale: 3, hold: 0, exhale: 6, name: 'Calm Breathing' }
        };
        
        const selected = techniques[technique];
        this.currentTechnique = selected;
        this.sessionStartTime = Date.now();
        this.cycleCount = 0;
        this.isPaused = false;
        this.totalPausedDuration = 0;
        
        // Hide technique selection and show breathing exercise
        document.getElementById('breathingTechniques').style.display = 'none';
        document.getElementById('breathingContainer').style.display = 'block';
        
        // Update breathing container
        document.getElementById('breathingContainer').innerHTML = `
            <button class="btn btn-secondary" style="margin-bottom: 1rem;" onclick="app.backToTechniques()">
                <i class="fas fa-arrow-left"></i> Back to Techniques
            </button>
            <h3>${selected.name}</h3>
            <div class="breathing-stats">
                <div class="breathing-stat">
                    <span class="stat-label">Cycles</span>
                    <span class="stat-value" id="cycleCount">0</span>
                </div>
                <div class="breathing-stat">
                    <span class="stat-label">Session Time</span>
                    <span class="stat-value" id="sessionTime">0:00</span>
                </div>
            </div>
            <div class="breathing-visual">
                <div class="breathing-circle" id="breathingCircle">
                    <svg class="progress-ring" width="200" height="200">
                        <circle class="progress-ring-bg" cx="100" cy="100" r="90" />
                        <circle class="progress-ring-circle" cx="100" cy="100" r="90" />
                    </svg>
                    <div class="breathing-inner">
                        <div class="breathing-text" id="breathingText">Get Ready</div>
                        <div class="breathing-counter" id="breathingCounter"></div>
                    </div>
                </div>
            </div>
            <div class="breathing-progress">
                <div class="breathing-progress-bar" id="breathingProgress"></div>
            </div>
            <div class="breathing-controls">
                <button class="btn btn-secondary" onclick="app.pauseBreathing()" id="pauseBtn">Pause</button>
                <button class="btn btn-secondary" onclick="app.stopBreathing()">Stop</button>
            </div>
        `;
        
        // Start session timer
        this.sessionTimer = setInterval(() => this.updateSessionTimer(), 1000);
        
        // Start breathing cycle
        this.breathingCycle();
    }

    // Update session timer
    updateSessionTimer() {
        if (!this.isPaused && this.sessionStartTime) {
            const elapsed = Math.floor((Date.now() - this.sessionStartTime - this.totalPausedDuration) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('sessionTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Breathing cycle
    breathingCycle() {
        if (this.isPaused) return;
        
        const circle = document.getElementById('breathingCircle');
        const text = document.getElementById('breathingText');
        const counter = document.getElementById('breathingCounter');
        const progress = document.getElementById('breathingProgress');
        const progressCircle = document.querySelector('.progress-ring-circle');
        
        const phases = [
            { 
                text: 'Breathe In', 
                duration: this.currentTechnique.inhale * 1000, 
                class: 'breathing-in',
                color: '#6366f1'
            },
            { 
                text: 'Hold', 
                duration: this.currentTechnique.hold * 1000, 
                class: 'breathing-hold',
                color: '#eab308'
            },
            { 
                text: 'Breathe Out', 
                duration: this.currentTechnique.exhale * 1000, 
                class: 'breathing-out',
                color: '#10b981'
            }
        ];
        
        if (this.currentTechnique.hold === 0) {
            phases.splice(1, 1); // Remove hold phase for calm breathing
        }
        
        let phaseIndex = 0;
        
        const runPhase = () => {
            if (this.isPaused) return;
            
            const phase = phases[phaseIndex];
            circle.className = 'breathing-circle ' + phase.class;
            text.textContent = phase.text;
            progress.style.background = phase.color;
            
            // Animate progress circle
            const circumference = 2 * Math.PI * 90;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.stroke = phase.color;
            
            let timeLeft = phase.duration / 1000;
            counter.textContent = timeLeft.toFixed(1);
            
            // Smooth countdown
            progressCircle.style.strokeDashoffset = 0;
            progressCircle.style.transition = 'none';
            setTimeout(() => {
                progressCircle.style.transition = `stroke-dashoffset ${phase.duration}ms linear`;
                progressCircle.style.strokeDashoffset = circumference;
            }, 50);
            
            this.breathingTimer = setInterval(() => {
                if (this.isPaused) return;
                
                timeLeft -= 0.1;
                if (timeLeft <= 0) {
                    clearInterval(this.breathingTimer);
                    
                    phaseIndex++;
                    if (phaseIndex >= phases.length) {
                        phaseIndex = 0;
                        this.cycleCount++;
                        document.getElementById('cycleCount').textContent = this.cycleCount;
                        
                        // Check for milestone
                        if (this.cycleCount % 5 === 0) {
                            this.showMilestone(this.cycleCount);
                        }
                    }
                    
                    // Add small pause between phases
                    setTimeout(() => {
                        if (!this.isPaused) {
                            runPhase();
                        }
                    }, 200);
                } else {
                    counter.textContent = timeLeft.toFixed(1);
                }
            }, 100);
        };
        
        runPhase();
    }

    // Show milestone popup
    showMilestone(cycles) {
        const popup = document.createElement('div');
        popup.className = 'milestone-popup';
        popup.innerHTML = `
            <div class="milestone-content">
                <div class="milestone-icon">🎉</div>
                <div class="milestone-text">Amazing! ${cycles} cycles completed!</div>
            </div>
        `;
        document.body.appendChild(popup);
        
        setTimeout(() => popup.classList.add('show'), 100);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 500);
        }, 2000);
    }

    // Pause breathing
    pauseBreathing() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        if (this.isPaused) {
            this.pausedTime = Date.now();
            clearInterval(this.breathingTimer);
        } else {
            this.totalPausedDuration += Date.now() - this.pausedTime;
            this.breathingCycle();
        }
    }

    // Stop breathing exercise
    stopBreathing() {
        clearInterval(this.breathingTimer);
        clearInterval(this.sessionTimer);
        
        if (this.sessionStartTime) {
            const duration = Math.floor((Date.now() - this.sessionStartTime - this.totalPausedDuration) / 1000);
            this.data.breathingSessions.push({
                technique: this.currentTechnique.name,
                duration: duration,
                cycles: this.cycleCount,
                date: new Date().toISOString()
            });
            this.saveData();
            this.updateStats();
            this.checkAchievements();
        }
        
        document.querySelector('.breathing-container').innerHTML = `
            <p>Great job! You completed ${this.cycleCount} cycles.</p>
            <button class="btn btn-primary" onclick="showPage('home')">Back to Home</button>
        `;
    }

    // Back to techniques
    backToTechniques() {
        this.stopBreathing();
        document.getElementById('breathingTechniques').style.display = 'grid';
        document.getElementById('breathingContainer').style.display = 'none';
        document.getElementById('breathingContainer').innerHTML = '';
    }

    // Journal methods
    loadJournalPrompt() {
        const prompts = [
            "What are three things you're grateful for today?",
            "Describe a moment today that made you smile.",
            "What's one thing you learned about yourself recently?",
            "If today had a color, what would it be and why?",
            "What's something you're looking forward to?",
            "Describe how you're feeling right now in detail.",
            "What would you tell your younger self today?",
            "What small victory did you achieve today?",
            "What's been on your mind lately?",
            "How have you grown in the past month?"
        ];
        
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        document.getElementById('journalPrompt').textContent = randomPrompt;
    }

    // Add journal tag
    addTag(tag) {
        if (!this.currentTags.includes(tag)) {
            this.currentTags.push(tag);
            this.updateTagDisplay();
        }
    }

    // Update tag display
    updateTagDisplay() {
        const container = document.getElementById('selectedTags');
        container.innerHTML = this.currentTags.map(tag => `
            <span class="selected-tag">
                ${tag}
                <span onclick="app.removeTag('${tag}')">&times;</span>
            </span>
        `).join('');
    }

    // Remove tag
    removeTag(tag) {
        this.currentTags = this.currentTags.filter(t => t !== tag);
        this.updateTagDisplay();
    }

    // Update journal word count
    updateWordCount() {
        const content = document.getElementById('journalContent').value;
        const wordCount = content.trim().split(/\s+/).length;
        document.getElementById('wordCount').textContent = content.trim() === '' ? 0 : wordCount;
    }

    // Save journal entry
    saveJournal() {
        const content = document.getElementById('journalContent').value.trim();
        if (!content) {
            alert('Please write something before saving');
            return;
        }
        
        const entry = {
            content: content,
            tags: [...this.currentTags],
            wordCount: content.split(/\s+/).length,
            date: new Date().toISOString()
        };
        
        this.data.journals.push(entry);
        this.saveData();
        this.updateStats();
        this.checkAchievements();
        
        // Reset form
        document.getElementById('journalContent').value = '';
        this.currentTags = [];
        this.updateTagDisplay();
        this.updateWordCount();
        this.loadJournalPrompt();
        this.loadRecentEntries();
        
        // Show success
        const saveBtn = document.querySelector('.save-journal-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Entry Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
            // Go back to home page after saving
            showPage('home');
        }, 1500);
    }

    // Load recent journal entries
    loadRecentEntries() {
        const container = document.getElementById('recentEntries');
        const recent = this.data.journals.slice(-3).reverse();
        
        if (recent.length === 0) {
            container.innerHTML = '<p class="no-entries">No journal entries yet. Start writing!</p>';
            return;
        }
        
        container.innerHTML = recent.map(entry => {
            const date = new Date(entry.date);
            const preview = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');
            
            return `
                <div class="recent-entry">
                    <div class="entry-date">${date.toLocaleDateString()}</div>
                    <div class="entry-preview">${preview}</div>
                    <div class="entry-tags">
                        ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Insights methods
    updateInsights() {
        const container = document.getElementById('insightsContent');
        
        if (this.data.moods.length === 0) {
            container.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">📊</div>
                    <h3>No mood data yet</h3>
                    <p>Start tracking your moods to see insights and patterns!</p>
                    <button class="btn btn-primary" onclick="showPage('mood')">
                        <i class="fas fa-plus"></i> Track Your First Mood
                    </button>
                </div>
            `;
            return;
        }
        
        // Get last 7 days of data
        const last7Days = this.getLast7DaysMoods();
        
        // Calculate average mood
        const avgMood = last7Days.reduce((sum, day) => sum + day.average, 0) / last7Days.length;
        const moodTrend = this.calculateMoodTrend(last7Days);
        
        // Get most common factors
        const factorCounts = {};
        this.data.moods.forEach(mood => {
            mood.factors.forEach(factor => {
                factorCounts[factor] = (factorCounts[factor] || 0) + 1;
            });
        });
        
        const topFactors = Object.entries(factorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        // Count journal themes
        const tagCounts = {};
        this.data.journals.forEach(entry => {
            entry.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        container.innerHTML = `
            <div class="insights-grid">
                <div class="insight-card">
                    <div class="insight-icon">📊</div>
                    <h4>Average Mood</h4>
                    <div class="insight-value">${avgMood.toFixed(1)}/5</div>
                    <div class="insight-trend ${moodTrend > 0 ? 'positive' : moodTrend < 0 ? 'negative' : ''}">
                        ${moodTrend > 0 ? '↑' : moodTrend < 0 ? '↓' : '→'} ${Math.abs(moodTrend)}%
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-icon">🎯</div>
                    <h4>Top Mood Factors</h4>
                    <div class="factor-list">
                        ${topFactors.map(([factor, count]) => `
                            <div class="factor-item">
                                <span>${this.getFactorIcon(factor)} ${factor}</span>
                                <span class="factor-count">${count}x</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-icon">📈</div>
                    <h4>Weekly Summary</h4>
                    <div class="summary-stats">
                        <div>Check-ins: ${last7Days.reduce((sum, day) => sum + day.count, 0)}</div>
                        <div>Best Day: ${this.getBestDay(last7Days)}</div>
                        <div>Consistency: ${this.getConsistencyScore()}%</div>
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-icon">📝</div>
                    <h4>Journal Themes</h4>
                    <div class="theme-cloud">
                        ${Object.entries(tagCounts).slice(0, 5).map(([tag, count]) => `
                            <span class="theme-tag" style="font-size: ${1 + (count * 0.2)}rem">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="mood-chart-container">
                <h4>7-Day Mood Trend</h4>
                <canvas id="moodChart"></canvas>
            </div>
        `;
        
        // Initialize chart
        this.updateMoodChart();
    }

    // Get last 7 days moods
    getLast7DaysMoods() {
        const days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayMoods = this.data.moods.filter(mood => 
                new Date(mood.date).toDateString() === dateStr
            );
            
            days.push({
                date: date,
                moods: dayMoods,
                average: dayMoods.length > 0 
                    ? dayMoods.reduce((sum, m) => sum + m.value, 0) / dayMoods.length 
                    : 0,
                count: dayMoods.length
            });
        }
        
        return days;
    }

    // Calculate mood trend
    calculateMoodTrend(days) {
        const firstHalf = days.slice(0, 3);
        const secondHalf = days.slice(4, 7);
        
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.average, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.average, 0) / secondHalf.length;
        
        return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
    }

    // Get best day
    getBestDay(days) {
        const bestDay = days.reduce((best, day) => 
            day.average > best.average ? day : best
        );
        return bestDay.date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Get consistency score
    getConsistencyScore() {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const daysWithEntries = new Set();
        this.data.moods.forEach(mood => {
            const moodDate = new Date(mood.date);
            if (moodDate >= last7Days) {
                daysWithEntries.add(moodDate.toDateString());
            }
        });
        
        return Math.round((daysWithEntries.size / 7) * 100);
    }

    // Get factor icon
    getFactorIcon(factor) {
        const icons = {
            'Sleep': '😴',
            'Exercise': '🏃',
            'Diet': '🥗',
            'Social': '👥',
            'Work': '💼',
            'Weather': '☀️',
            'Health': '❤️',
            'Stress': '😰'
        };
        return icons[factor] || '📌';
    }

    // Update mood chart
    updateMoodChart() {
        const canvas = document.getElementById('moodChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const last7Days = this.getLast7DaysMoods();
        
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            canvas.parentElement.innerHTML = '<p>Chart loading error. Please refresh.</p>';
            return;
        }
        
        // Destroy existing chart if any
        if (window.moodChartInstance) {
            window.moodChartInstance.destroy();
        }
        
        try {
            window.moodChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: last7Days.map(d => d.date.toLocaleDateString('en-US', { weekday: 'short' })),
                    datasets: [{
                        label: 'Average Mood',
                        data: last7Days.map(d => d.average || null),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const dayData = last7Days[context.dataIndex];
                                    return `Mood: ${context.parsed.y.toFixed(1)} (${dayData.count} entries)`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    const emojis = ['', '😢', '😟', '😐', '🙂', '😊'];
                                    return emojis[value] || value;
                                }
                            },
                            grid: {
                                color: 'rgba(99, 102, 241, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(99, 102, 241, 0.1)'
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Chart initialization error:', error);
            canvas.parentElement.innerHTML = '<p>Unable to display chart. Please try again.</p>';
        }
    }

    // Export data
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `mindfulme_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Puzzle game implementation
let puzzleGame = {
    currentPuzzle: null,
    startTime: null,
    score: 0,
    hintsUsed: 0,
    timer: null
};

// Initialize puzzle
function initPuzzle(type) {
    puzzleGame.currentPuzzle = type;
    puzzleGame.startTime = Date.now();
    puzzleGame.score = 100;
    puzzleGame.hintsUsed = 0;
    
    document.getElementById('puzzleSelection').style.display = 'none';
    document.getElementById('puzzleGame').style.display = 'block';
    
    // Start timer
    puzzleGame.timer = setInterval(updatePuzzleTimer, 1000);
    
    switch(type) {
        case 'wordsearch':
            initWordSearch();
            break;
        case 'crossword':
            initCrossword();
            break;
        case 'sudoku':
            initSudoku();
            break;
    }
}

// Update puzzle timer
function updatePuzzleTimer() {
    const elapsed = Math.floor((Date.now() - puzzleGame.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('puzzleTimer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Word search puzzle
function initWordSearch() {
    const words = ['MINDFUL', 'PEACEFUL', 'GRATEFUL', 'BREATHE', 'CALM'];
    const gridSize = 10;
    const grid = [];
    
    // Create empty grid
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = '';
        }
    }
    
    // Place words
    words.forEach(word => {
        let placed = false;
        while (!placed) {
            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * gridSize);
            
            if (canPlaceWord(grid, word, row, col, direction)) {
                placeWord(grid, word, row, col, direction);
                placed = true;
            }
        }
    });
    
    // Fill empty cells
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
    
    // Display puzzle
    const container = document.getElementById('puzzleContainer');
    container.innerHTML = `
        <h3>Find these words:</h3>
        <div class="word-list">${words.map(w => `<span class="word-item" data-word="${w}">${w}</span>`).join(' ')}</div>
        <div class="word-search-grid">
            ${grid.map((row, i) => 
                row.map((cell, j) => `<div class="grid-cell" data-row="${i}" data-col="${j}">${cell}</div>`).join('')
            ).join('')}
        </div>
    `;
    
    // Add click handlers
    let selecting = false;
    let selectedCells = [];
    
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.addEventListener('mousedown', () => {
            selecting = true;
            selectedCells = [cell];
            cell.classList.add('selecting');
        });
        
        cell.addEventListener('mouseenter', () => {
            if (selecting) {
                selectedCells.push(cell);
                cell.classList.add('selecting');
            }
        });
    });
    
    document.addEventListener('mouseup', () => {
        if (selecting) {
            checkWordSelection(selectedCells, words);
            selectedCells.forEach(cell => cell.classList.remove('selecting'));
            selecting = false;
            selectedCells = [];
        }
    });
}

// Helper functions for word search
function canPlaceWord(grid, word, row, col, direction) {
    if (direction === 'horizontal') {
        if (col + word.length > grid[0].length) return false;
        for (let i = 0; i < word.length; i++) {
            if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) return false;
        }
    } else {
        if (row + word.length > grid.length) return false;
        for (let i = 0; i < word.length; i++) {
            if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) return false;
        }
    }
    return true;
}

function placeWord(grid, word, row, col, direction) {
    if (direction === 'horizontal') {
        for (let i = 0; i < word.length; i++) {
            grid[row][col + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[row + i][col] = word[i];
        }
    }
}

function checkWordSelection(cells, words) {
    const selected = cells.map(cell => cell.textContent).join('');
    const reversed = selected.split('').reverse().join('');
    
    words.forEach(word => {
        if (selected === word || reversed === word) {
            cells.forEach(cell => cell.classList.add('found'));
            document.querySelector(`[data-word="${word}"]`).classList.add('found');
            puzzleGame.score += 20;
            checkPuzzleComplete();
        }
    });
}

// Crossword puzzle
function initCrossword() {
    const grid = [
        [1, 'P', 'E', 'A', 'C', 'E', null, null, null, null],
        ['R', null, null, null, 'A', null, null, 2, 'R', null],
        [3, 'M', 'E', 'D', 'I', 'T', 'A', 'T', 'I', 'O'],
        ['A', null, null, null, 'M', null, null, 'H', null, 'N'],
        ['T', null, 4, 'H', 'A', 'P', 'P', 'Y', null, null],
        ['H', null, null, null, 'T', null, null, null, null, null],
        ['E', null, null, null, 'E', null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null]
    ];
    
    const clues = {
        across: [
            { number: 1, text: "State of being calm (5)" },
            { number: 3, text: "Mindfulness practice (10)" },
            { number: 4, text: "Feeling of joy (5)" }
        ],
        down: [
            { number: 1, text: "To inhale and exhale (7)" },
            { number: 2, text: "Thankful feeling (8)" }
        ]
    };
    
    const container = document.getElementById('puzzleContainer');
    
    // Build the complete HTML
    let html = '<div class="crossword-container">';
    html += '<div class="crossword-grid-wrapper">';
    html += '<div class="crossword-grid">';
    
    // Create all cells
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = grid[i][j];
            
            if (cell === null) {
                html += '<div class="crossword-cell black"></div>';
            } else if (typeof cell === 'number') {
                html += `<div style="position: relative;">
                            <span class="crossword-number">${cell}</span>
                            <input type="text" 
                                   class="crossword-cell" 
                                   data-row="${i}" 
                                   data-col="${j}" 
                                   maxlength="1"
                                   onkeydown="handleCrosswordNav(event, ${i}, ${j})">
                        </div>`;
            } else if (typeof cell === 'string') {
                html += `<input type="text" 
                               class="crossword-cell" 
                               data-row="${i}" 
                               data-col="${j}" 
                               data-answer="${cell}"
                               maxlength="1"
                               onkeydown="handleCrosswordNav(event, ${i}, ${j})">`;
            }
        }
    }
    
    html += '</div></div>'; // Close crossword-grid and wrapper
    
    // Add clues
    html += '<div class="crossword-clues">';
    html += '<h4>Across</h4>';
    html += clues.across.map(c => 
        `<div class="clue"><span class="clue-number">${c.number}.</span> ${c.text}</div>`
    ).join('');
    
    html += '<h4>Down</h4>';
    html += clues.down.map(c => 
        `<div class="clue"><span class="clue-number">${c.number}.</span> ${c.text}</div>`
    ).join('');
    
    html += '<button class="btn btn-secondary" style="margin-top: 1rem; width: 100%;" onclick="checkCrossword()">Check Answers</button>';
    html += '</div></div>'; // Close crossword-clues and container
    
    // Set the HTML all at once
    container.innerHTML = html;
    
    // Add input event listeners after elements are in DOM
    setTimeout(() => {
        document.querySelectorAll('.crossword-cell:not(.black)').forEach(cell => {
            cell.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        });
    }, 0);
}

// Handle crossword navigation
function handleCrosswordNav(event, row, col) {
    const key = event.key;
    let nextCell;
    
    switch(key) {
        case 'ArrowUp':
            nextCell = document.querySelector(`[data-row="${row-1}"][data-col="${col}"]`);
            break;
        case 'ArrowDown':
        case 'Enter':
            nextCell = document.querySelector(`[data-row="${row+1}"][data-col="${col}"]`);
            break;
        case 'ArrowLeft':
            nextCell = document.querySelector(`[data-row="${row}"][data-col="${col-1}"]`);
            break;
        case 'ArrowRight':
        case 'Tab':
            if (key === 'Tab') event.preventDefault();
            nextCell = document.querySelector(`[data-row="${row}"][data-col="${col+1}"]`);
            break;
    }
    
    if (nextCell && !nextCell.classList.contains('black')) {
        nextCell.focus();
    }
}

// Check crossword answers
function checkCrossword() {
    let correct = 0;
    let total = 0;
    
    document.querySelectorAll('.crossword-cell[data-answer]').forEach(cell => {
        total++;
        if (cell.value.toUpperCase() === cell.dataset.answer) {
            cell.style.backgroundColor = 'rgba(16, 185, 129, 0.3)';
            correct++;
        } else if (cell.value) {
            cell.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        }
    });
    
    if (correct === total) {
        completePuzzle();
    } else {
        setTimeout(() => {
            document.querySelectorAll('.crossword-cell[data-answer]').forEach(cell => {
                cell.style.backgroundColor = '';
            });
        }, 2000);
    }
}

// Sudoku puzzle
function initSudoku() {
    const puzzle = [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ];
    
    const container = document.getElementById('puzzleContainer');
    
    // Build the complete HTML
    let html = '<h3>Fill in the numbers 1-9</h3>';
    html += '<p style="color: var(--text-secondary); margin-bottom: 1rem;">Each row, column, and 3x3 box must contain all digits 1-9</p>';
    html += '<div class="sudoku-grid">';
    html += '<div class="sudoku-row-divider row-3"></div>';
    html += '<div class="sudoku-row-divider row-6"></div>';
    
    // Create all cells
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const value = puzzle[i][j];
            html += `<input type="number" 
                           class="sudoku-cell ${value !== 0 ? 'fixed' : ''}" 
                           data-row="${i}" 
                           data-col="${j}" 
                           value="${value || ''}" 
                           ${value !== 0 ? 'readonly' : ''}
                           min="1" 
                           max="9"
                           onkeydown="handleSudokuNav(event, ${i}, ${j})"
                           oninput="validateSudokuInput(this, ${i}, ${j})">`;
        }
    }
    
    html += '</div>'; // Close sudoku-grid
    html += '<button class="btn btn-secondary" style="margin-top: 1rem;" onclick="checkSudokuComplete()">Check Solution</button>';
    
    // Set the HTML all at once
    container.innerHTML = html;
}

// Handle sudoku navigation
function handleSudokuNav(event, row, col) {
    const key = event.key;
    let nextCell;
    
    // Prevent default for arrow keys
    if (key.startsWith('Arrow')) {
        event.preventDefault();
    }
    
    switch(key) {
        case 'ArrowUp':
            nextCell = document.querySelector(`[data-row="${Math.max(0, row-1)}"][data-col="${col}"]`);
            break;
        case 'ArrowDown':
            nextCell = document.querySelector(`[data-row="${Math.min(8, row+1)}"][data-col="${col}"]`);
            break;
        case 'ArrowLeft':
            nextCell = document.querySelector(`[data-row="${row}"][data-col="${Math.max(0, col-1)}"]`);
            break;
        case 'ArrowRight':
            nextCell = document.querySelector(`[data-row="${row}"][data-col="${Math.min(8, col+1)}"]`);
            break;
    }
    
    if (nextCell && !nextCell.classList.contains('fixed')) {
        nextCell.focus();
        nextCell.select();
    }
}

// Validate sudoku input
function validateSudokuInput(cell, row, col) {
    const val = parseInt(cell.value);
    
    // Remove any non-numeric or invalid input
    if (!val || val < 1 || val > 9) {
        cell.value = '';
        cell.classList.remove('error');
        return;
    }
    
    // Check for conflicts
    let hasConflict = false;
    
    // Check row
    document.querySelectorAll(`[data-row="${row}"]`).forEach(c => {
        if (c !== cell && c.value === cell.value) {
            hasConflict = true;
        }
    });
    
    // Check column
    document.querySelectorAll(`[data-col="${col}"]`).forEach(c => {
        if (c !== cell && c.value === cell.value) {
            hasConflict = true;
        }
    });
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
        for (let j = boxCol; j < boxCol + 3; j++) {
            const c = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            if (c !== cell && c.value === cell.value) {
                hasConflict = true;
            }
        }
    }
    
    if (hasConflict) {
        cell.classList.add('error');
    } else {
        cell.classList.remove('error');
    }
}

// Check if puzzle is complete
function checkPuzzleComplete() {
    const foundWords = document.querySelectorAll('.word-item.found').length;
    const totalWords = document.querySelectorAll('.word-item').length;
    
    if (foundWords === totalWords) {
        completePuzzle();
    }
}

function checkSudokuComplete() {
    const cells = document.querySelectorAll('.sudoku-cell');
    let complete = true;
    let hasErrors = false;
    
    cells.forEach(cell => {
        if (!cell.value) complete = false;
        if (cell.classList.contains('error')) hasErrors = false;
    });
    
    if (complete && !hasErrors) {
        // Validate solution (simplified)
        completePuzzle();
    } else {
        alert('Please complete the puzzle and fix any errors (highlighted in red)');
    }
}

// Complete puzzle
function completePuzzle() {
    clearInterval(puzzleGame.timer);
    
    const elapsed = Math.floor((Date.now() - puzzleGame.startTime) / 1000);
    const finalScore = Math.max(0, puzzleGame.score - puzzleGame.hintsUsed * 10);
    
    app.data.puzzlesCompleted = (app.data.puzzlesCompleted || 0) + 1;
    app.saveData();
    app.checkAchievements();
    
    document.getElementById('puzzleContainer').innerHTML = `
        <div class="puzzle-complete">
            <h2>🎉 Puzzle Complete!</h2>
            <div class="complete-stats">
                <div>Time: ${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}</div>
                <div>Score: ${finalScore}</div>
                <div>Hints Used: ${puzzleGame.hintsUsed}</div>
            </div>
            <button class="btn btn-primary" onclick="resetPuzzle()">Play Another</button>
        </div>
    `;
}

// Reset puzzle
function resetPuzzle() {
    puzzleGame = {
        currentPuzzle: null,
        startTime: null,
        score: 0,
        hintsUsed: 0,
        timer: null
    };
    
    document.getElementById('puzzleSelection').style.display = 'block';
    document.getElementById('puzzleGame').style.display = 'none';
}

// Get hint
function getHint() {
    puzzleGame.hintsUsed++;
    puzzleGame.score -= 10;
    
    // Provide hint based on puzzle type
    switch(puzzleGame.currentPuzzle) {
        case 'wordsearch':
            // Highlight first letter of unfound word
            const unfound = document.querySelector('.word-item:not(.found)');
            if (unfound) {
                alert(`Look for "${unfound.dataset.word[0]}" to start finding "${unfound.dataset.word}"`);
            }
            break;
        case 'crossword':
            alert('Try filling in the shorter words first!');
            break;
        case 'sudoku':
            alert('Look for rows, columns, or boxes with only one missing number!');
            break;
    }
}

// Navigation functions
function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.hero-section, .mood-tracker, .breathing-exercise, .journal, .insights, .resources, .puzzle-feature').forEach(section => {
        section.style.display = 'none';
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Show selected page
    switch(page) {
        case 'home':
            document.querySelector('.hero-section').style.display = 'block';
            app.updateStats();
            app.displayAchievements();
            break;
        case 'mood':
            document.querySelector('.mood-tracker').style.display = 'block';
            app.updateDateTime();
            break;
        case 'breathe':
            document.querySelector('.breathing-exercise').style.display = 'block';
            break;
        case 'journal':
            document.querySelector('.journal').style.display = 'block';
            app.loadJournalPrompt();
            app.loadRecentEntries();
            break;
        case 'insights':
            document.querySelector('.insights').style.display = 'block';
            app.updateInsights();
            break;
        case 'resources':
            document.querySelector('.resources').style.display = 'block';
            break;
        case 'puzzle':
            document.querySelector('.puzzle-feature').style.display = 'block';
            break;
    }
}

// Pause breathing function
function pauseBreathing() {
    if (app) {
        app.pauseBreathing();
    }
}

// Initialize app when page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MindfulMeApp();
    
    // Show home page by default
    showPage('home');
});

// End of app.js file

            

        
