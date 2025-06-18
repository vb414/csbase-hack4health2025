// MindfulMe - Enhanced Mental Health Companion
// Complete app.js with all fixes and enhancements

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
            zenMaster: { id: 'zenMaster', name: 'Zen Master', description: '30 minutes of breathing exercises', icon: '🧘', unlocked: false }
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
        
        // Mindful minutes
        const totalMinutes = this.data.breathingSessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
        document.getElementById('mindfulMinutes').textContent = totalMinutes;
        
        // Weekly check-ins
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyCheckIns = this.data.moods.filter(mood => new Date(mood.date) >= weekAgo).length;
        document.getElementById('weeklyCheckIns').textContent = weeklyCheckIns;
    }

    // Load journal prompt
    loadJournalPrompt() {
        const prompts = [
            "What are three things you're grateful for today?",
            "Describe a moment today when you felt at peace.",
            "What challenge did you face today and how did you handle it?",
            "If today had a color, what would it be and why?",
            "What's one thing you learned about yourself today?",
            "How did you show kindness to yourself or others today?",
            "What would you tell your younger self about today?",
            "Describe your ideal day. How close was today to it?",
            "What emotions visited you today? How did you welcome them?",
            "What's one small victory you achieved today?"
        ];
        
        const promptEl = document.getElementById('journalPrompt');
        if (promptEl) {
            const todayPrompt = prompts[new Date().getDate() % prompts.length];
            promptEl.textContent = `Today's prompt: ${todayPrompt}`;
        }
    }

    // Load recent journal entries
    loadRecentEntries() {
        const recentEntries = document.getElementById('recentEntries');
        if (!recentEntries) return;
        
        const entries = this.data.journals.slice(-5).reverse();
        recentEntries.innerHTML = '';
        
        if (entries.length === 0) {
            recentEntries.innerHTML = '<p style="color: var(--text-secondary);">No entries yet. Start journaling to see your history!</p>';
            return;
        }
        
        entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'journal-entry-item';
            
            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            entryDiv.innerHTML = `
                <div class="entry-date">${dateStr}</div>
                <div class="entry-preview">${entry.content.substring(0, 150)}...</div>
                ${entry.tags ? `<div class="tags-container">${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            `;
            
            entryDiv.onclick = () => this.viewJournalEntry(entry);
            recentEntries.appendChild(entryDiv);
        });
    }

    // View full journal entry
    viewJournalEntry(entry) {
        const journalEntry = document.getElementById('journalEntry');
        if (journalEntry) {
            journalEntry.value = entry.content;
            this.updateWordCount();
        }
    }

    // Save mood
    saveMood() {
        if (!this.currentMood) {
            this.showSuccess('Please select a mood first! 😊', 'warning');
            return;
        }
        
        const note = document.getElementById('moodNote').value;
        const hour = new Date().getHours();
        
        const moodEntry = {
            date: new Date().toISOString(),
            emoji: this.currentMood.emoji,
            value: this.currentMood.value,
            factors: this.selectedFactors,
            note: note
        };
        
        this.data.moods.push(moodEntry);
        
        // Track used mood values
        if (!this.data.usedMoodValues) {
            this.data.usedMoodValues = new Set();
        }
        if (this.data.usedMoodValues instanceof Array) {
            this.data.usedMoodValues = new Set(this.data.usedMoodValues);
        }
        this.data.usedMoodValues.add(this.currentMood.value);
        
        // Check time-based achievements
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
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('selected'));
        document.getElementById('moodNote').value = '';
        this.currentMood = null;
        this.selectedFactors = [];
        
        this.showSuccess('Mood tracked successfully! Keep it up! 🌟');
        
        // Update insights if visible
        if (document.getElementById('insights').style.display !== 'none') {
            this.updateInsights();
        }
    }

    // Save journal entry
    saveJournal() {
        const content = document.getElementById('journalEntry').value.trim();
        
        if (!content) {
            this.showSuccess('Please write something first! ✍️', 'warning');
            return;
        }
        
        const journalEntry = {
            date: new Date().toISOString(),
            content: content,
            tags: this.currentTags,
            wordCount: content.split(/\s+/).length
        };
        
        this.data.journals.push(journalEntry);
        this.saveData();
        this.updateStats();
        this.checkAchievements();
        
        // Reset form
        document.getElementById('journalEntry').value = '';
        this.currentTags = [];
        document.getElementById('tagsContainer').innerHTML = '';
        this.updateWordCount();
        
        this.showSuccess('Journal entry saved! Your thoughts are safe. 📔');
        this.loadRecentEntries();
    }

    // Enhanced Start breathing exercise with visual timer
    startBreathing(type) {
        const container = document.getElementById('breathingContainer');
        const circle = document.getElementById('breathingCircle');
        const text = document.getElementById('breathingText');
        const counter = document.getElementById('breathingCounter');
        const progressBar = document.getElementById('progressBar');
        const cyclesEl = document.getElementById('cyclesCount');
        
        container.style.display = 'block';
        
        // Hide technique cards with animation
        document.querySelector('.breathing-techniques').style.display = 'none';
        
        // Reset counters
        this.cycleCount = 0;
        this.isPaused = false;
        cyclesEl.textContent = '0';
        
        let phases;
        let totalCycleDuration;
        
        switch(type) {
            case '478':
                phases = [
                    { text: 'Breathe In', duration: 4, action: 'in', color: '#6366f1' },
                    { text: 'Hold', duration: 7, action: 'hold', color: '#fbbf24' },
                    { text: 'Breathe Out', duration: 8, action: 'out', color: '#34d399' }
                ];
                break;
            case 'box':
                phases = [
                    { text: 'Breathe In', duration: 4, action: 'in', color: '#6366f1' },
                    { text: 'Hold', duration: 4, action: 'hold', color: '#fbbf24' },
                    { text: 'Breathe Out', duration: 4, action: 'out', color: '#34d399' },
                    { text: 'Hold Empty', duration: 4, action: 'hold', color: '#ef4444' }
                ];
                break;
            case 'calm':
                phases = [
                    { text: 'Breathe In', duration: 3, action: 'in', color: '#6366f1' },
                    { text: 'Breathe Out', duration: 3, action: 'out', color: '#34d399' }
                ];
                break;
        }
        
        totalCycleDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
        this.sessionStartTime = Date.now();
        let currentPhase = 0;
        let phaseStart = Date.now();
        let pausedTime = 0;
        
        // Start session timer
        this.updateSessionTimer();
        this.sessionTimer = setInterval(() => this.updateSessionTimer(), 100); // Update every 100ms for smooth display
        
        // Create visual countdown ring
        const createCountdownRing = () => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'countdown-ring');
            svg.setAttribute('width', '260');
            svg.setAttribute('height', '260');
            svg.innerHTML = `
                <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(99, 102, 241, 0.1)" stroke-width="8"/>
                <circle id="progressRing" cx="130" cy="130" r="120" fill="none" stroke="${phases[0].color}" stroke-width="8"
                        stroke-dasharray="753.6" stroke-dashoffset="0" transform="rotate(-90 130 130)"
                        style="transition: stroke-dashoffset 0.1s linear, stroke 0.3s ease;"/>
            `;
            circle.appendChild(svg);
        };
        
        createCountdownRing();
        const progressRing = document.getElementById('progressRing');
        
        // Animation function
        const animate = () => {
            if (!this.isPaused) {
                const now = Date.now();
                const phaseElapsed = (now - phaseStart - pausedTime) / 1000;
                const totalElapsed = (now - this.sessionStartTime - pausedTime) / 1000;
                
                // Update counter with decimal for smooth countdown
                const remaining = Math.max(0, phases[currentPhase].duration - phaseElapsed);
                counter.textContent = remaining.toFixed(1);
                
                // Update circular progress
                const phaseProgress = phaseElapsed / phases[currentPhase].duration;
                const ringProgress = 753.6 * (1 - phaseProgress);
                progressRing.style.strokeDashoffset = ringProgress;
                
                // Update linear progress bar
                const cycleProgress = ((totalElapsed % totalCycleDuration) / totalCycleDuration) * 100;
                progressBar.style.width = `${cycleProgress}%`;
                progressBar.style.background = phases[currentPhase].color;
                
                // Add pulsing effect during breathing
                if (phases[currentPhase].action === 'in') {
                    circle.style.transform = `scale(${1 + phaseProgress * 0.2})`;
                } else if (phases[currentPhase].action === 'out') {
                    circle.style.transform = `scale(${1.2 - phaseProgress * 0.2})`;
                } else {
                    circle.style.transform = 'scale(1)';
                }
                
                // Check if phase is complete
                if (phaseElapsed >= phases[currentPhase].duration) {
                    currentPhase = (currentPhase + 1) % phases.length;
                    
                    // Increment cycle count when completing a full cycle
                    if (currentPhase === 0) {
                        this.cycleCount++;
                        cyclesEl.textContent = this.cycleCount;
                        
                        // Celebration effect every 5 cycles
                        if (this.cycleCount % 5 === 0) {
                            this.showMilestone(this.cycleCount);
                        }
                    }
                    
                    phaseStart = now;
                    pausedTime = 0;
                    
                    // Update text and colors
                    text.textContent = phases[currentPhase].text;
                    progressRing.style.stroke = phases[currentPhase].color;
                    
                    // Add haptic feedback simulation (visual pulse)
                    circle.classList.add('phase-change');
                    setTimeout(() => circle.classList.remove('phase-change'), 300);
                }
            } else {
                pausedTime += 16; // Account for paused time
            }
            
            this.breathingInterval = requestAnimationFrame(animate);
        };
        
        // Start animation
        text.textContent = phases[0].text;
        animate();
        
        // Track session duration
        this.breathingTimer = this.sessionStartTime;
    }

    // Add session timer update method
    updateSessionTimer() {
        if (!this.sessionStartTime || this.isPaused) return;
        
        const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('sessionTimer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Add milestone celebration
    showMilestone(cycles) {
        const milestone = document.createElement('div');
        milestone.className = 'milestone-popup';
        milestone.innerHTML = `
            <div class="milestone-icon">🎉</div>
            <div class="milestone-text">${cycles} cycles completed!</div>
        `;
        document.getElementById('breathingContainer').appendChild(milestone);
        
        setTimeout(() => milestone.classList.add('show'), 100);
        setTimeout(() => {
            milestone.classList.remove('show');
            setTimeout(() => milestone.remove(), 500);
        }, 2000);
    }

    // Stop breathing exercise
    stopBreathing() {
        if (this.breathingInterval) {
            cancelAnimationFrame(this.breathingInterval);
            this.breathingInterval = null;
        }
        
        // Clear session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        // Save session
        if (this.breathingTimer) {
            const duration = Math.floor((Date.now() - this.breathingTimer) / 1000);
            this.data.breathingSessions.push({
                date: new Date().toISOString(),
                duration: duration,
                cycles: this.cycleCount
            });
            this.saveData();
            this.updateStats();
            this.checkAchievements();
        }
        
        // Reset UI
        document.getElementById('breathingContainer').style.display = 'none';
        document.querySelector('.breathing-techniques').style.display = 'grid';
        const circle = document.getElementById('breathingCircle');
        if (circle) {
            circle.style.transform = 'scale(1)';
            circle.innerHTML = '<div class="inner-circle"></div><span class="breathing-text" id="breathingText">Get Ready</span>';
        }
        document.getElementById('sessionTimer').textContent = '0:00';
        document.getElementById('cyclesCount').textContent = '0';
        
        this.showSuccess(`Great session! ${this.cycleCount} cycles completed. 🌊`);
        
        // Reset variables
        this.sessionStartTime = null;
        this.cycleCount = 0;
        this.isPaused = false;
    }

    // Fixed Update insights method
    updateInsights() {
        const insightsMessage = document.getElementById('insightsMessage');
        const insightsGrid = document.querySelector('.insights-grid');
        const chartSection = document.querySelector('.chart-section');
        
        // Check if there's any data
        if (!this.data.moods || this.data.moods.length === 0) {
            if (insightsMessage) insightsMessage.style.display = 'block';
            if (insightsGrid) insightsGrid.style.display = 'none';
            if (chartSection) chartSection.style.display = 'none';
            return;
        } else {
            if (insightsMessage) insightsMessage.style.display = 'none';
            if (insightsGrid) insightsGrid.style.display = 'grid';
            if (chartSection) chartSection.style.display = 'block';
        }

        this.updateMoodChart();
        this.updateMoodPatterns();
        this.updateTopFactors();
        this.updateWeeklySummary();
        this.updateJournalThemes();
    }

    // Fixed Update mood chart method
    updateMoodChart() {
        const canvas = document.getElementById('moodChart');
        if (!canvas) {
            console.error('Mood chart canvas not found');
            return;
        }
        
        try {
            const ctx = canvas.getContext('2d');
            
            // Get last 7 days of data
            const days = [];
            const moodValues = [];
            const moodCounts = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toDateString();
                
                const dayMoods = this.data.moods.filter(mood => {
                    try {
                        return new Date(mood.date).toDateString() === dateStr;
                    } catch (e) {
                        console.error('Invalid date in mood entry:', mood);
                        return false;
                    }
                });
                
                days.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
                
                if (dayMoods.length > 0) {
                    const avgMood = dayMoods.reduce((sum, mood) => sum + (mood.value || 3), 0) / dayMoods.length;
                    moodValues.push(avgMood);
                    moodCounts.push(dayMoods.length);
                } else {
                    moodValues.push(null);
                    moodCounts.push(0);
                }
            }
            
            // Destroy existing chart if it exists
            if (window.moodChart && typeof window.moodChart.destroy === 'function') {
                window.moodChart.destroy();
            }
            
            // Create new chart
            window.moodChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Average Mood',
                        data: moodValues,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 8,
                        pointHoverRadius: 10,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        spanGaps: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            titleColor: '#f1f5f9',
                            bodyColor: '#cbd5e1',
                            borderColor: '#6366f1',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function(context) {
                                    const value = context.parsed.y;
                                    if (value === null) return 'No data';
                                    
                                    const moodEmojis = ['😢', '😟', '😐', '🙂', '😊'];
                                    const emoji = moodEmojis[Math.round(value) - 1] || '😐';
                                    const count = moodCounts[context.dataIndex];
                                    
                                    return [
                                        `Mood: ${emoji} (${value.toFixed(1)}/5)`,
                                        `Entries: ${count}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            min: 0.5,
                            max: 5.5,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    const moodEmojis = ['', '😢', '😟', '😐', '🙂', '😊'];
                                    return moodEmojis[value] || '';
                                },
                                color: '#cbd5e1',
                                font: {
                                    size: 16
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            }
                        },
                        x: {
                            ticks: {
                                color: '#cbd5e1',
                                font: {
                                    size: 12
                                },
                                maxRotation: 45,
                                minRotation: 45
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)',
                                drawBorder: false
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating mood chart:', error);
        }
    }

    // Update mood patterns
    updateMoodPatterns() {
        const patternsDiv = document.getElementById('moodPatterns');
        
        if (this.data.moods.length === 0) {
            patternsDiv.innerHTML = '<p class="insight-item">No mood data yet</p>';
            return;
        }
        
        // Calculate patterns
        const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        const dayOfWeek = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
        
        this.data.moods.forEach(mood => {
            const date = new Date(mood.date);
            const hour = date.getHours();
            
            if (hour < 6) timeOfDay.night++;
            else if (hour < 12) timeOfDay.morning++;
            else if (hour < 18) timeOfDay.afternoon++;
            else timeOfDay.evening++;
            
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            dayOfWeek[day]++;
        });
        
        // Find best time and day
        const bestTime = Object.entries(timeOfDay).sort((a, b) => b[1] - a[1])[0][0];
        const bestDay = Object.entries(dayOfWeek).sort((a, b) => b[1] - a[1])[0][0];
        
        patternsDiv.innerHTML = `
            <p class="insight-item">📅 Most active day: <strong>${bestDay}</strong></p>
            <p class="insight-item">🕐 Most active time: <strong>${bestTime}</strong></p>
            <p class="insight-item">📊 Total check-ins: <strong>${this.data.moods.length}</strong></p>
        `;
    }

    // Update top factors
    updateTopFactors() {
        const factorsDiv = document.getElementById('topFactors');
        
        const factorCounts = {};
        this.data.moods.forEach(mood => {
            if (mood.factors) {
                mood.factors.forEach(factor => {
                    factorCounts[factor] = (factorCounts[factor] || 0) + 1;
                });
            }
        });
        
        const sortedFactors = Object.entries(factorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        if (sortedFactors.length === 0) {
            factorsDiv.innerHTML = '<p class="insight-item">No mood factors tracked yet</p>';
            return;
        }
        
        factorsDiv.innerHTML = sortedFactors.map(([factor, count]) => `
            <div class="factor-bar">
                <span class="factor-name">${factor}</span>
                <span class="factor-count">${count}</span>
            </div>
        `).join('');
    }

    // Update weekly summary
    updateWeeklySummary() {
        const summaryDiv = document.getElementById('weeklySummary');
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weekMoods = this.data.moods.filter(mood => new Date(mood.date) >= weekAgo);
        const weekJournals = this.data.journals.filter(journal => new Date(journal.date) >= weekAgo);
        const weekBreathing = this.data.breathingSessions.filter(session => new Date(session.date) >= weekAgo);
        
        const avgMood = weekMoods.length > 0 
            ? (weekMoods.reduce((sum, mood) => sum + mood.value, 0) / weekMoods.length).toFixed(1)
            : 'N/A';
        
        const totalBreathingMins = Math.floor(weekBreathing.reduce((sum, session) => sum + session.duration, 0) / 60);
        
        summaryDiv.innerHTML = `
            <p class="insight-item">📊 Mood checks: <strong>${weekMoods.length}</strong></p>
            <p class="insight-item">📝 Journal entries: <strong>${weekJournals.length}</strong></p>
            <p class="insight-item">🌬️ Breathing minutes: <strong>${totalBreathingMins}</strong></p>
            <p class="insight-item">😊 Average mood: <strong>${avgMood}/5</strong></p>
        `;
    }

    // Update journal themes
    updateJournalThemes() {
        const themesDiv = document.getElementById('journalThemes');
        
        const allTags = {};
        this.data.journals.forEach(journal => {
            if (journal.tags) {
                journal.tags.forEach(tag => {
                    allTags[tag] = (allTags[tag] || 0) + 1;
                });
            }
        });
        
        const sortedTags = Object.entries(allTags).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        if (sortedTags.length === 0) {
            themesDiv.innerHTML = '<p class="insight-item">No journal tags yet</p>';
            return;
        }
        
        themesDiv.innerHTML = sortedTags.map(([tag, count]) => `
            <div class="factor-bar">
                <span class="factor-name">#${tag}</span>
                <span class="factor-count">${count}</span>
            </div>
        `).join('');
    }

    // Export data
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindfulme_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Data exported successfully! 📁');
    }

    // Show success message
    showSuccess(message, type = 'success') {
        const successMsg = document.getElementById('successMessage');
        successMsg.textContent = message;
        
        if (type === 'warning') {
            successMsg.style.background = 'var(--accent)';
        } else {
            successMsg.style.background = 'var(--success)';
        }
        
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 3000);
    }

    // Update word count
    updateWordCount() {
        const content = document.getElementById('journalEntry').value;
        const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
        document.getElementById('wordCount').textContent = `${wordCount} words`;
    }
}

// Global app instance
let app;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app = new MindfulMeApp();
    
    // Add event listeners
    const journalEntry = document.getElementById('journalEntry');
    if (journalEntry) {
        journalEntry.addEventListener('input', () => app.updateWordCount());
    }
    
    const tagInput = document.getElementById('tagInput');
    if (tagInput) {
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });
    }
});

// Navigation functions
function showHome() {
    hideAllSections();
    document.getElementById('home').style.display = 'block';
    app.updateStats();
    app.displayAchievements();
}

function showFeature(feature) {
    hideAllSections();
    document.getElementById(feature).style.display = 'block';
    
    if (feature === 'insights') {
        app.updateInsights();
    }
}

function hideAllSections() {
    const sections = ['home', 'mood', 'breathing', 'journal', 'insights', 'resources'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// Mood tracking functions
function selectMood(btn, emoji, value) {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    app.currentMood = { emoji, value };
}

function toggleChip(chip) {
    chip.classList.toggle('selected');
    const factor = chip.textContent.trim();
    
    if (chip.classList.contains('selected')) {
        app.selectedFactors.push(factor);
    } else {
        app.selectedFactors = app.selectedFactors.filter(f => f !== factor);
    }
}

function saveMood() {
    app.saveMood();
}

// Breathing functions
function startBreathing(type) {
    app.startBreathing(type);
}

function stopBreathing() {
    app.stopBreathing();
}

// Add pause/resume functionality
function pauseBreathing() {
    const pauseBtn = document.getElementById('pauseBtn');
    if (app.isPaused) {
        app.isPaused = false;
        pauseBtn.textContent = 'Pause';
        app.sessionStartTime = Date.now(); // Reset timer
    } else {
        app.isPaused = true;
        pauseBtn.textContent = 'Resume';
    }
}

// Journal functions
function saveJournal() {
    app.saveJournal();
}

function addTag() {
    const input = document.getElementById('tagInput');
    const tag = input.value.trim();
    
    if (tag && !app.currentTags.includes(tag)) {
        app.currentTags.push(tag);
        
        const tagEl = document.createElement('span');
        tagEl.className = 'tag';
        tagEl.innerHTML = `${tag} <span class="remove-tag" onclick="removeTag('${tag}')">×</span>`;
        
        document.getElementById('tagsContainer').appendChild(tagEl);
        input.value = '';
    }
}

function removeTag(tag) {
    app.currentTags = app.currentTags.filter(t => t !== tag);
    
    const tagsContainer = document.getElementById('tagsContainer');
    const tags = tagsContainer.querySelectorAll('.tag');
    tags.forEach(tagEl => {
        if (tagEl.textContent.includes(tag)) {
            tagEl.remove();
        }
    });
}

// Export data function
function exportData() {
    app.exportData();
}
