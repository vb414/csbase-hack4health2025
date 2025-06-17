// MindfulMe - Enhanced Mental Health Companion
// Main JavaScript Application

// Data Management
class MindfulMeApp {
    constructor() {
        this.data = this.loadData();
        this.currentMood = null;
        this.selectedFactors = [];
        this.currentTags = [];
        this.breathingInterval = null;
        this.breathingTimer = null;
        this.init();
    }

    // Initialize app
    init() {
        this.updateStats();
        this.updateDateTime();
        this.loadJournalPrompt();
        this.loadRecentEntries();
        this.checkDailyStreak();
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
        
        // Auto-save every 5 minutes
        setInterval(() => this.saveData(), 300000);
    }

    // Load data from localStorage
    loadData() {
        const savedData = localStorage.getItem('mindfulme_data');
        if (savedData) {
            return JSON.parse(savedData);
        }
        return {
            moods: [],
            journals: [],
            breathingSessions: [],
            lastVisit: new Date().toDateString(),
            streak: 1,
            preferences: {
                reminderTime: null,
                theme: 'dark'
            }
        };
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('mindfulme_data', JSON.stringify(this.data));
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
        
        const moodEntry = {
            date: new Date().toISOString(),
            emoji: this.currentMood.emoji,
            value: this.currentMood.value,
            factors: this.selectedFactors,
            note: note
        };
        
        this.data.moods.push(moodEntry);
        this.saveData();
        this.updateStats();
        
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
        
        // Reset form
        document.getElementById('journalEntry').value = '';
        this.currentTags = [];
        document.getElementById('tagsContainer').innerHTML = '';
        this.updateWordCount();
        
        this.showSuccess('Journal entry saved! Your thoughts are safe. 📔');
        this.loadRecentEntries();
    }

    // Start breathing exercise
    startBreathing(type) {
        const container = document.getElementById('breathingContainer');
        const circle = document.getElementById('breathingCircle');
        const text = document.getElementById('breathingText');
        const counter = document.getElementById('breathingCounter');
        const progressBar = document.getElementById('progressBar');
        
        container.style.display = 'block';
        
        // Hide technique cards
        document.querySelector('.breathing-techniques').style.display = 'none';
        
        let phases;
        switch(type) {
            case '478':
                phases = [
                    { text: 'Breathe In', duration: 4, action: 'in' },
                    { text: 'Hold', duration: 7, action: 'hold' },
                    { text: 'Breathe Out', duration: 8, action: 'out' }
                ];
                break;
            case 'box':
                phases = [
                    { text: 'Breathe In', duration: 4, action: 'in' },
                    { text: 'Hold', duration: 4, action: 'hold' },
                    { text: 'Breathe Out', duration: 4, action: 'out' },
                    { text: 'Hold', duration: 4, action: 'hold' }
                ];
                break;
            case 'calm':
                phases = [
                    { text: 'Breathe In', duration: 3, action: 'in' },
                    { text: 'Breathe Out', duration: 3, action: 'out' }
                ];
                break;
        }
        
        const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
        const sessionStart = Date.now();
        let currentPhase = 0;
        let phaseStart = Date.now();
        let currentCount = phases[0].duration;
        
        // Animation function
        const animate = () => {
            const now = Date.now();
            const phaseElapsed = (now - phaseStart) / 1000;
            const totalElapsed = (now - sessionStart) / 1000;
            
            // Update counter
            const remaining = Math.ceil(phases[currentPhase].duration - phaseElapsed);
            counter.textContent = remaining;
            
            // Update progress bar
            const progress = (totalElapsed % totalDuration) / totalDuration * 100;
            progressBar.style.width = `${progress}%`;
            
            // Check if phase is complete
            if (phaseElapsed >= phases[currentPhase].duration) {
                currentPhase = (currentPhase + 1) % phases.length;
                phaseStart = now;
                
                // Update text and animation
                text.textContent = phases[currentPhase].text;
                
                // Remove all animation classes
                circle.classList.remove('breathing-in', 'breathing-out');
                
                // Add appropriate animation class
                if (phases[currentPhase].action === 'in') {
                    circle.classList.add('breathing-in');
                } else if (phases[currentPhase].action === 'out') {
                    circle.classList.add('breathing-out');
                }
            }
            
            this.breathingInterval = requestAnimationFrame(animate);
        };
        
        // Start animation
        text.textContent = phases[0].text;
        if (phases[0].action === 'in') {
            circle.classList.add('breathing-in');
        }
        animate();
        
        // Track session duration
        this.breathingTimer = sessionStart;
    }

    // Stop breathing exercise
    stopBreathing() {
        if (this.breathingInterval) {
            cancelAnimationFrame(this.breathingInterval);
            this.breathingInterval = null;
        }
        
        // Save session
        if (this.breathingTimer) {
            const duration = Math.floor((Date.now() - this.breathingTimer) / 1000);
            this.data.breathingSessions.push({
                date: new Date().toISOString(),
                duration: duration
            });
            this.saveData();
            this.updateStats();
        }
        
        // Reset UI
        document.getElementById('breathingContainer').style.display = 'none';
        document.querySelector('.breathing-techniques').style.display = 'grid';
        document.getElementById('breathingCircle').classList.remove('breathing-in', 'breathing-out');
        
        this.showSuccess('Great breathing session! Feel the calm. 🌊');
    }

    // Update insights
    updateInsights() {
        this.updateMoodChart();
        this.updateMoodPatterns();
        this.updateTopFactors();
        this.updateWeeklySummary();
        this.updateJournalThemes();
    }

    // Update mood chart
    updateMoodChart() {
        const ctx = document.getElementById('moodChart').getContext('2d');
        
        // Get last 7 days of data
        const days = [];
        const moodValues = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayMoods = this.data.moods.filter(mood => 
                new Date(mood.date).toDateString() === dateStr
            );
            
            days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            if (dayMoods.length > 0) {
                const avgMood = dayMoods.reduce((sum, mood) => sum + mood.value, 0) / dayMoods.length;
                moodValues.push(avgMood);
            } else {
                moodValues.push(null);
            }
        }
        
        // Create or update chart
        if (window.moodChart) {
            window.moodChart.destroy();
        }
        
        window.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Mood Score',
                    data: moodValues,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
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
                                const moodEmojis = ['😢', '😟', '😐', '🙂', '😊'];
                                const value = context.parsed.y;
                                if (value) {
                                    return `Mood: ${moodEmojis[Math.round(value) - 1]} (${value.toFixed(1)}/5)`;
                                }
                                return 'No data';
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
                                const moodEmojis = ['', '😢', '😟', '😐', '🙂', '😊'];
                                return moodEmojis[value] || '';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
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
    updateTopFactors() {20px;
    padding: 2rem;
    margin: 2rem auto;
    max-width: 800px;
    text-align: center;
    border: 1px solid rgba(99, 102, 241, 0.2);
    display: none;
}

.breathing-techniques {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.technique-card {
    background: rgba(99, 102, 241, 0.1);
    border-radius: 15px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.technique-card:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: var(--primary);
    transform: translateY(-3px);
}

.technique-card h3 {
    color: var(--primary);
    margin-bottom: 0.5rem;
}

.technique-timing {
    color: var(--accent);
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.breathing-container {
    margin-top: 2rem;
}

.breathing-circle {
    width: 200px;
    height: 200px;
    margin: 2rem auto;
    border-radius: 50%;
    background: radial-gradient(circle, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.5);
    position: relative;
}

.breathing-circle.breathing-in {
    animation: breatheIn 4s ease-in-out;
}

.breathing-circle.breathing-out {
    animation: breatheOut 4s ease-in-out;
}

@keyframes breatheIn {
    from { transform: scale(1); }
    to { transform: scale(1.3); }
}

@keyframes breatheOut {
    from { transform: scale(1.3); }
    to { transform: scale(1); }
}

.breathing-counter {
    font-size: 3rem;
    color: var(--accent);
    margin: 1rem 0;
}

.breathing-progress {
    width: 300px;
    height: 10px;
    background: rgba(99, 102, 241, 0.2);
    border-radius: # MindfulMe - Complete GitHub Repository Files
