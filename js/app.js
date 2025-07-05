// MindfulMe - Advanced Mental Health Platform
// Version 2.0 with AI, Biometrics, and Community Features

// Advanced Data Management with Encryption
class MindfulMeAdvanced {
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
        
        // Advanced features
        this.aiModel = null;
        this.encryptionKey = null;
        this.biometricData = {
            hrv: [],
            voiceSentiment: [],
            facialEmotion: []
        };
        this.communityPosts = [];
        this.meditationAudio = null;
        this.syncEnabled = false;
        
        this.init();
    }

    // Initialize advanced achievements
    initAchievements() {
        return {
            // Original achievements
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
            puzzleSolver: { id: 'puzzleSolver', name: 'Puzzle Solver', description: 'Complete your first puzzle', icon: '🧩', unlocked: false },
            
            // New advanced achievements
            aiInsights: { id: 'aiInsights', name: 'AI Enlightened', description: 'Receive 10 AI predictions', icon: '🤖', unlocked: false },
            biometricPro: { id: 'biometricPro', name: 'Biometric Pro', description: 'Use HRV monitoring 5 times', icon: '❤️', unlocked: false },
            communityHelper: { id: 'communityHelper', name: 'Community Helper', description: 'Support 5 community members', icon: '🤝', unlocked: false },
            meditationMaster: { id: 'meditationMaster', name: 'Meditation Master', description: 'Complete 30 meditation sessions', icon: '🧘‍♀️', unlocked: false },
            dataScientist: { id: 'dataScientist', name: 'Data Scientist', description: 'View correlation matrix 10 times', icon: '📊', unlocked: false },
            safetyFirst: { id: 'safetyFirst', name: 'Safety First', description: 'Create your safety plan', icon: '🛡️', unlocked: false },
            therapistConnected: { id: 'therapistConnected', name: 'Professional Support', description: 'Share data with therapist', icon: '👨‍⚕️', unlocked: false }
        };
    }

    // Advanced initialization
    async init() {
        this.loadAchievements();
        this.updateStats();
        this.updateDateTime();
        this.loadJournalPrompt();
        this.loadRecentEntries();
        this.checkDailyStreak();
        this.displayAchievements();
        
        // Initialize advanced features
        await this.initializeAI();
        await this.initializeEncryption();
        this.initializeBiometrics();
        this.initializePWA();
        this.loadCommunityPosts();
        
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);
        
        // Auto-save every 5 minutes
        setInterval(() => this.saveData(), 300000);
        
        // Sync data if enabled
        if (this.syncEnabled) {
            setInterval(() => this.syncData(), 60000);
        }
    }

    // Initialize AI Model
    async initializeAI() {
        try {
            // Create a neural network for mood prediction
            this.aiModel = tf.sequential({
                layers: [
                    tf.layers.dense({
                        inputShape: [14], // Multiple factors
                        units: 32,
                        activation: 'relu'
                    }),
                    tf.layers.dropout({ rate: 0.2 }),
                    tf.layers.dense({
                        units: 16,
                        activation: 'relu'
                    }),
                    tf.layers.dense({
                        units: 5,
                        activation: 'softmax' // 5 mood categories
                    })
                ]
            });

            this.aiModel.compile({
                optimizer: tf.train.adam(0.001),
                loss: 'categoricalCrossentropy',
                metrics: ['accuracy']
            });

            // Load or train model
            await this.loadOrTrainModel();
            
            console.log('AI Model initialized successfully');
        } catch (error) {
            console.error('Error initializing AI:', error);
        }
    }

    // Load or train AI model
    async loadOrTrainModel() {
        try {
            // Try to load existing model
            this.aiModel = await tf.loadLayersModel('localstorage://mood-prediction-model');
        } catch (e) {
            // Train new model if we have enough data
            if (this.data.moods.length >= 30) {
                await this.trainModel();
            }
        }
    }

    // Train AI model
    async trainModel() {
        const trainingData = this.prepareTrainingData();
        if (!trainingData) return;

        await this.aiModel.fit(trainingData.xs, trainingData.ys, {
            epochs: 50,
            batchSize: 32,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Training epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        });

        // Save model
        await this.aiModel.save('localstorage://mood-prediction-model');
    }

    // Prepare training data for AI
    prepareTrainingData() {
        if (this.data.moods.length < 30) return null;

        const features = [];
        const labels = [];

        this.data.moods.forEach((mood, index) => {
            if (index === 0) return; // Skip first entry (no previous data)

            const date = new Date(mood.date);
            const feature = [
                date.getHours() / 24, // Normalized hour
                date.getDay() / 7, // Normalized day of week
                mood.factors.includes('Sleep') ? 1 : 0,
                mood.factors.includes('Exercise') ? 1 : 0,
                mood.factors.includes('Diet') ? 1 : 0,
                mood.factors.includes('Social') ? 1 : 0,
                mood.factors.includes('Work') ? 1 : 0,
                mood.factors.includes('Weather') ? 1 : 0,
                mood.factors.includes('Health') ? 1 : 0,
                mood.factors.includes('Stress') ? 1 : 0,
                this.getPreviousMoodAverage(date, 1),
                this.getPreviousMoodAverage(date, 3),
                this.getPreviousMoodAverage(date, 7),
                this.getSleepQuality(date) // Additional biometric data
            ];

            features.push(feature);
            
            // One-hot encode the mood value
            const label = Array(5).fill(0);
            label[mood.value - 1] = 1;
            labels.push(label);
        });

        return {
            xs: tf.tensor2d(features),
            ys: tf.tensor2d(labels)
        };
    }

    // Get previous mood average
    getPreviousMoodAverage(currentDate, days) {
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - days);
        
        const relevantMoods = this.data.moods.filter(mood => {
            const moodDate = new Date(mood.date);
            return moodDate >= startDate && moodDate < currentDate;
        });

        if (relevantMoods.length === 0) return 0.5; // Neutral default
        
        const sum = relevantMoods.reduce((acc, mood) => acc + mood.value, 0);
        return sum / relevantMoods.length / 5; // Normalize to 0-1
    }

    // Get sleep quality (simulated for now)
    getSleepQuality(date) {
        // In a real app, this would come from wearable data
        return Math.random(); // 0-1 scale
    }

    // Predict next mood
    async predictNextMood() {
        if (!this.aiModel || this.data.moods.length < 5) {
            return null;
        }

        const date = new Date();
        const features = [
            date.getHours() / 24,
            date.getDay() / 7,
            0, 0, 0, 0, 0, 0, 0, 0, // Factors (unknown for future)
            this.getPreviousMoodAverage(date, 1),
            this.getPreviousMoodAverage(date, 3),
            this.getPreviousMoodAverage(date, 7),
            this.getSleepQuality(date)
        ];

        const prediction = await this.aiModel.predict(tf.tensor2d([features])).data();
        const predictedMood = prediction.indexOf(Math.max(...prediction)) + 1;
        const confidence = Math.max(...prediction);

        return {
            mood: predictedMood,
            confidence: confidence,
            recommendations: this.generateRecommendations(predictedMood)
        };
    }

    // Generate AI recommendations
    generateRecommendations(predictedMood) {
        const recommendations = {
            1: [ // Very Sad
                { icon: '🚶', text: 'Take a 10-minute walk outside', priority: 'high' },
                { icon: '📞', text: 'Call a trusted friend or family member', priority: 'high' },
                { icon: '🧘', text: 'Try the emergency breathing exercise', priority: 'medium' }
            ],
            2: [ // Sad
                { icon: '🎵', text: 'Listen to your favorite uplifting music', priority: 'medium' },
                { icon: '📝', text: 'Journal about your feelings', priority: 'high' },
                { icon: '🌞', text: 'Get some sunlight exposure', priority: 'medium' }
            ],
            3: [ // Neutral
                { icon: '🎯', text: 'Set a small goal for today', priority: 'low' },
                { icon: '🏃', text: 'Add some physical activity', priority: 'medium' },
                { icon: '🙏', text: 'Practice gratitude meditation', priority: 'low' }
            ],
            4: [ // Happy
                { icon: '📸', text: 'Capture this moment in your journal', priority: 'low' },
                { icon: '🤝', text: 'Share positivity in the community', priority: 'medium' },
                { icon: '🎨', text: 'Express yourself creatively', priority: 'low' }
            ],
            5: [ // Very Happy
                { icon: '🎉', text: 'Celebrate your achievement', priority: 'low' },
                { icon: '💝', text: 'Pay it forward with kindness', priority: 'medium' },
                { icon: '📈', text: 'Reflect on what brought you here', priority: 'high' }
            ]
        };

        return recommendations[predictedMood] || recommendations[3];
    }

    // Initialize Encryption
    async initializeEncryption() {
        try {
            // Generate or load encryption key
            const savedKey = localStorage.getItem('mindfulme_encryption_key');
            
            if (savedKey) {
                this.encryptionKey = await crypto.subtle.importKey(
                    'jwk',
                    JSON.parse(savedKey),
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt']
                );
            } else {
                // Generate new key
                this.encryptionKey = await crypto.subtle.generateKey(
                    { name: 'AES-GCM', length: 256 },
                    true,
                    ['encrypt', 'decrypt']
                );
                
                // Export and save key
                const exportedKey = await crypto.subtle.exportKey('jwk', this.encryptionKey);
                localStorage.setItem('mindfulme_encryption_key', JSON.stringify(exportedKey));
            }
            
            console.log('Encryption initialized');
        } catch (error) {
            console.error('Error initializing encryption:', error);
        }
    }

    // Encrypt data
    async encryptData(data) {
        if (!this.encryptionKey) return data;

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            dataBuffer
        );

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedData))
        };
    }

    // Decrypt data
    async decryptData(encryptedData) {
        if (!this.encryptionKey || !encryptedData.iv) return encryptedData;

        try {
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
                this.encryptionKey,
                new Uint8Array(encryptedData.data)
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
    // Initialize Biometrics
    initializeBiometrics() {
        // Initialize camera for HRV
        this.initializeHRV();
        
        // Initialize face detection
        this.initializeFaceDetection();
        
        // Initialize voice analysis
        this.initializeVoiceAnalysis();
    }

    // Initialize HRV monitoring
    async initializeHRV() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            });
            
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            
            // Simulated HRV calculation (in real app, would use rPPG algorithm)
            setInterval(() => {
                if (this.isMonitoringHRV) {
                    const hrv = this.calculateHRV(video);
                    this.biometricData.hrv.push({
                        value: hrv,
                        timestamp: new Date().toISOString()
                    });
                    this.updateHRVDisplay(hrv);
                }
            }, 1000);
            
        } catch (error) {
            console.log('HRV monitoring not available:', error);
        }
    }

    // Calculate HRV (simplified)
    calculateHRV(video) {
        // In a real implementation, this would use remote photoplethysmography
        // For now, return simulated data
        return 50 + Math.random() * 30; // 50-80 ms
    }

    // Update HRV display
    updateHRVDisplay(hrv) {
        const hrvDisplay = document.getElementById('hrvDisplay');
        if (hrvDisplay) {
            hrvDisplay.textContent = `${Math.round(hrv)} ms`;
            
            // Update status
            const status = document.getElementById('hrvStatus');
            if (status) {
                if (hrv > 60) {
                    status.textContent = 'Excellent';
                    status.className = 'hrv-status coherence-high';
                } else if (hrv > 40) {
                    status.textContent = 'Good';
                    status.className = 'hrv-status coherence-medium';
                } else {
                    status.textContent = 'Stressed';
                    status.className = 'hrv-status coherence-low';
                }
            }
        }
    }

    // Initialize Face Detection
    async initializeFaceDetection() {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceExpressionNet.loadFromUri('/models');
            
            console.log('Face detection initialized');
        } catch (error) {
            console.log('Face detection not available:', error);
        }
    }

    // Detect facial emotion
    async detectFacialEmotion(imageElement) {
        if (!faceapi.nets.tinyFaceDetector.isLoaded) return null;

        const detections = await faceapi
            .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

        if (detections) {
            const emotions = detections.expressions;
            const dominantEmotion = Object.keys(emotions).reduce((a, b) => 
                emotions[a] > emotions[b] ? a : b
            );
            
            this.biometricData.facialEmotion.push({
                emotion: dominantEmotion,
                confidence: emotions[dominantEmotion],
                timestamp: new Date().toISOString()
            });
            
            return dominantEmotion;
        }
        
        return null;
    }

    // Initialize Voice Analysis
    initializeVoiceAnalysis() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('Voice analysis not available');
            return;
        }

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.voiceAnalyzer = this.audioContext.createAnalyser();
        this.voiceAnalyzer.fftSize = 2048;
    }

    // Analyze voice sentiment
    async analyzeVoiceSentiment() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.voiceAnalyzer);
            
            const bufferLength = this.voiceAnalyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // Analyze voice characteristics
            const analyzeVoice = () => {
                if (!this.isAnalyzingVoice) return;
                
                this.voiceAnalyzer.getByteFrequencyData(dataArray);
                
                // Calculate voice features
                const features = this.extractVoiceFeatures(dataArray);
                const sentiment = this.predictVoiceSentiment(features);
                
                this.biometricData.voiceSentiment.push({
                    sentiment: sentiment,
                    features: features,
                    timestamp: new Date().toISOString()
                });
                
                this.updateVoiceDisplay(sentiment);
                
                requestAnimationFrame(analyzeVoice);
            };
            
            analyzeVoice();
            
        } catch (error) {
            console.error('Voice analysis error:', error);
        }
    }

    // Extract voice features
    extractVoiceFeatures(dataArray) {
        // Calculate basic voice features
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        
        // Pitch (fundamental frequency)
        let maxIndex = 0;
        let maxValue = 0;
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > maxValue) {
                maxValue = dataArray[i];
                maxIndex = i;
            }
        }
        const pitch = maxIndex * (this.audioContext.sampleRate / this.voiceAnalyzer.fftSize);
        
        // Energy
        const energy = Math.sqrt(sum / dataArray.length);
        
        // Spectral centroid
        let weightedSum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            weightedSum += i * dataArray[i];
        }
        const spectralCentroid = weightedSum / sum;
        
        return {
            pitch: pitch,
            energy: energy,
            spectralCentroid: spectralCentroid,
            average: average
        };
    }

    // Predict voice sentiment
    predictVoiceSentiment(features) {
        // Simplified sentiment prediction based on voice features
        // In a real app, this would use a trained model
        
        const energyThreshold = 50;
        const pitchThreshold = 200;
        
        if (features.energy < energyThreshold && features.pitch < pitchThreshold) {
            return 'sad';
        } else if (features.energy > energyThreshold * 1.5 && features.pitch > pitchThreshold * 1.2) {
            return 'happy';
        } else if (features.spectralCentroid > 500) {
            return 'stressed';
        } else {
            return 'neutral';
        }
    }

    // Initialize PWA
    initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered');
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdatePrompt();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }

        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt(deferredPrompt);
        });
    }

    // Show install prompt
    showInstallPrompt(deferredPrompt) {
        const installPrompt = document.createElement('div');
        installPrompt.className = 'pwa-install-prompt show';
        installPrompt.innerHTML = `
            <i class="fas fa-download"></i>
            <span>Install MindfulMe for offline access</span>
            <button class="btn btn-primary" onclick="app.installPWA()">Install</button>
            <button class="btn btn-secondary" onclick="this.parentElement.remove()">Later</button>
        `;
        document.body.appendChild(installPrompt);
        
        this.deferredPrompt = deferredPrompt;
    }

    // Install PWA
    async installPWA() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('PWA installed');
        }
        
        this.deferredPrompt = null;
        document.querySelector('.pwa-install-prompt')?.remove();
    }

    // Community Features
    loadCommunityPosts() {
        // In a real app, this would fetch from a server
        this.communityPosts = [
            {
                id: 1,
                username: 'AnonymousOwl',
                avatar: 'AO',
                content: 'Today was tough, but I managed to complete my breathing exercises. Small wins!',
                likes: 23,
                comments: 5,
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                tags: ['anxiety', 'breathing', 'progress']
            },
            {
                id: 2,
                username: 'HopefulPanda',
                avatar: 'HP',
                content: 'My mood graph shows improvement over the past week! The AI recommendations really helped.',
                likes: 45,
                comments: 12,
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                tags: ['success', 'ai-insights', 'mood-tracking']
            }
        ];
        
        this.displayCommunityPosts();
    }

    // Display community posts
    displayCommunityPosts() {
        const container = document.getElementById('communityFeed');
        if (!container) return;

        container.innerHTML = this.communityPosts.map(post => `
            <div class="community-post">
                <div class="post-header">
                    <div class="post-avatar">${post.avatar}</div>
                    <div class="post-meta">
                        <div class="post-username">${post.username}</div>
                        <div class="post-time">${this.formatRelativeTime(post.timestamp)}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>
                <div class="post-actions">
                    <span class="post-action" onclick="app.likePost(${post.id})">
                        <i class="fas fa-heart"></i> ${post.likes}
                    </span>
                    <span class="post-action" onclick="app.commentPost(${post.id})">
                        <i class="fas fa-comment"></i> ${post.comments}
                    </span>
                    <span class="post-action" onclick="app.supportPost(${post.id})">
                        <i class="fas fa-hands-helping"></i> Support
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Format relative time
    formatRelativeTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    // Advanced Meditation Features
    async startMeditation(type) {
        const meditationTypes = {
            'guided': {
                name: 'Guided Meditation',
                duration: 600, // 10 minutes
                audioUrl: '/audio/guided-meditation.mp3',
                binaural: null
            },
            'binaural': {
                name: 'Binaural Beats',
                duration: 900, // 15 minutes
                audioUrl: null,
                binaural: { left: 200, right: 207.5 } // 7.5Hz theta waves
            },
            'breath': {
                name: 'Breath Focus',
                duration: 300, // 5 minutes
                audioUrl: '/audio/breath-focus.mp3',
                binaural: null
            }
        };

        const meditation = meditationTypes[type];
        this.currentMeditation = meditation;
        this.meditationStartTime = Date.now();

        // Initialize audio
        if (meditation.audioUrl) {
            this.meditationAudio = new Audio(meditation.audioUrl);
            this.meditationAudio.play();
        }

        if (meditation.binaural) {
            this.startBinauralBeats(meditation.binaural);
        }

        // Start HRV monitoring during meditation
        this.isMonitoringHRV = true;

        // Update UI
        this.showMeditationPlayer(meditation);
    }

    // Start binaural beats
    startBinauralBeats(frequencies) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create oscillators for left and right channels
        const oscillatorLeft = audioContext.createOscillator();
        const oscillatorRight = audioContext.createOscillator();
        
        // Create gain nodes
        const gainLeft = audioContext.createGain();
        const gainRight = audioContext.createGain();
        
        // Create stereo panner nodes
        const pannerLeft = audioContext.createStereoPanner();
        const pannerRight = audioContext.createStereoPanner();
        
        // Set frequencies
        oscillatorLeft.frequency.value = frequencies.left;
        oscillatorRight.frequency.value = frequencies.right;
        
        // Set panning
        pannerLeft.pan.value = -1; // Full left
        pannerRight.pan.value = 1; // Full right
        
        // Set volume
        gainLeft.gain.value = 0.3;
        gainRight.gain.value = 0.3;
        
        // Connect nodes
        oscillatorLeft.connect(gainLeft);
        oscillatorRight.connect(gainRight);
        gainLeft.connect(pannerLeft);
        gainRight.connect(pannerRight);
        pannerLeft.connect(audioContext.destination);
        pannerRight.connect(audioContext.destination);
        
        // Start oscillators
        oscillatorLeft.start();
        oscillatorRight.start();
        
        this.binauralOscillators = { left: oscillatorLeft, right: oscillatorRight };
    }

    // CBT Thought Challenging
    analyzeThought(thought) {
        // Cognitive distortions detection
        const distortions = {
            'all-or-nothing': /\b(always|never|every|none|nothing|everything)\b/i,
            'overgeneralization': /\b(all|every|never|always|no one|everyone)\b/i,
            'mental-filter': /\b(only|just|merely|simply)\b/i,
            'catastrophizing': /\b(worst|terrible|awful|disaster|catastrophe|horrible)\b/i,
            'personalization': /\b(my fault|blame myself|because of me)\b/i,
            'should-statements': /\b(should|must|ought|have to|need to)\b/i,
            'emotional-reasoning': /\b(feel|feeling|felt)\b.*\b(so|therefore|must be)\b/i,
            'labeling': /\b(am a|i'm a|loser|failure|stupid|worthless)\b/i
        };

        const detectedDistortions = [];
        
        for (const [distortion, pattern] of Object.entries(distortions)) {
            if (pattern.test(thought)) {
                detectedDistortions.push(distortion);
            }
        }

        // Generate reframe suggestions
        const reframes = this.generateReframes(thought, detectedDistortions);

        return {
            original: thought,
            distortions: detectedDistortions,
            reframes: reframes,
            timestamp: new Date().toISOString()
        };
    }

    // Generate reframe suggestions
    generateReframes(thought, distortions) {
        const reframes = [];

        if (distortions.includes('all-or-nothing')) {
            reframes.push({
                type: 'Balanced Thinking',
                suggestion: thought.replace(/always|never/gi, 'sometimes')
                    .replace(/everything|nothing/gi, 'some things')
            });
        }

        if (distortions.includes('catastrophizing')) {
            reframes.push({
                type: 'Reality Check',
                suggestion: 'What is the most likely outcome? What evidence supports this?'
            });
        }

        if (distortions.includes('should-statements')) {
            reframes.push({
                type: 'Preference vs Demand',
                suggestion: thought.replace(/should|must/gi, 'would prefer to')
                    .replace(/have to|need to/gi, 'would like to')
            });
        }

        // Add general reframe
        reframes.push({
            type: 'Alternative Perspective',
            suggestion: 'What would you tell a friend in this situation?'
        });

        return reframes;
    }

    // Crisis Detection
    detectCrisis(content) {
        const crisisKeywords = [
            'suicide', 'kill myself', 'end it all', 'not worth living',
            'self harm', 'hurt myself', 'cutting', 'overdose',
            'hopeless', 'no way out', 'can\'t go on', 'give up'
        ];

        const lowerContent = content.toLowerCase();
        const detected = crisisKeywords.some(keyword => lowerContent.includes(keyword));

        if (detected) {
            this.triggerCrisisIntervention();
            return true;
        }

        // Check mood patterns
        const recentMoods = this.data.moods.slice(-7);
        const avgMood = recentMoods.reduce((sum, m) => sum + m.value, 0) / recentMoods.length;
        
        if (avgMood < 2 && recentMoods.length >= 7) {
            this.showCrisisResources();
            return true;
        }

        return false;
    }

    // Trigger crisis intervention
    triggerCrisisIntervention() {
        // Show immediate help
        const alert = document.createElement('div');
        alert.className = 'crisis-alert show';
        alert.innerHTML = `
            <h3>We're here for you</h3>
            <p>It sounds like you're going through a really tough time.</p>
            <div class="crisis-actions">
                <button class="btn btn-primary" onclick="app.callCrisisLine()">
                    <i class="fas fa-phone"></i> Call 988 Now
                </button>
                <button class="btn btn-secondary" onclick="app.textCrisisLine()">
                    <i class="fas fa-comment"></i> Text Crisis Line
                </button>
            </div>
            <div class="safety-contacts">
                <h4>Your Safety Contacts:</h4>
                ${this.getSafetyContacts()}
            </div>
        `;
        document.body.appendChild(alert);

        // Log for safety tracking
        this.data.crisisEvents = this.data.crisisEvents || [];
        this.data.crisisEvents.push({
            timestamp: new Date().toISOString(),
            resolved: false
        });
        this.saveData();
    }

    // Get safety contacts
    getSafetyContacts() {
        const contacts = this.data.safetyContacts || [
            { name: 'Emergency', number: '911' },
            { name: 'Crisis Line', number: '988' }
        ];

        return contacts.map(contact => `
            <div class="safety-contact">
                <span>${contact.name}</span>
                <a href="tel:${contact.number}">${contact.number}</a>
            </div>
        `).join('');
    }

    // Data Sync with Encryption
    async syncData() {
        if (!this.syncEnabled || !navigator.onLine) return;

        try {
            // Encrypt data before sync
            const encryptedData = await this.encryptData(this.data);
            
            // In a real app, this would sync to a server
            // For now, we'll store in a different localStorage key
            localStorage.setItem('mindfulme_cloud_backup', JSON.stringify({
                encrypted: encryptedData,
                lastSync: new Date().toISOString(),
                deviceId: this.getDeviceId()
            }));

            this.updateSyncStatus('synced');
        } catch (error) {
            console.error('Sync error:', error);
            this.updateSyncStatus('error');
        }
    }

    // Update sync status
    updateSyncStatus(status) {
        const syncStatus = document.getElementById('syncStatus');
        if (!syncStatus) return;

        const statusMessages = {
            'syncing': '<i class="fas fa-sync sync-icon"></i> Syncing...',
            'synced': '<i class="fas fa-check"></i> Synced',
            'error': '<i class="fas fa-exclamation-triangle"></i> Sync Error',
            'offline': '<i class="fas fa-wifi-slash"></i> Offline'
        };

        syncStatus.innerHTML = statusMessages[status] || statusMessages['offline'];
    }

    // Generate correlation matrix
    generateCorrelationMatrix() {
        const factors = ['Sleep', 'Exercise', 'Diet', 'Social', 'Work', 'Weather', 'Health', 'Stress'];
        const matrix = [];

        factors.forEach(factor1 => {
            const row = [];
            factors.forEach(factor2 => {
                const correlation = this.calculateCorrelation(factor1, factor2);
                row.push(correlation);
            });
            matrix.push(row);
        });

        return { factors, matrix };
    }

    // Calculate correlation between factors
    calculateCorrelation(factor1, factor2) {
        const moodsWithFactor1 = this.data.moods.filter(m => m.factors.includes(factor1));
        const moodsWithFactor2 = this.data.moods.filter(m => m.factors.includes(factor2));
        const moodsWithBoth = this.data.moods.filter(m => 
            m.factors.includes(factor1) && m.factors.includes(factor2)
        );

        if (moodsWithFactor1.length === 0 || moodsWithFactor2.length === 0) return 0;

        // Calculate average mood for each
        const avg1 = moodsWithFactor1.reduce((sum, m) => sum + m.value, 0) / moodsWithFactor1.length;
        const avg2 = moodsWithFactor2.reduce((sum, m) => sum + m.value, 0) / moodsWithFactor2.length;
        const avgBoth = moodsWithBoth.length > 0 
            ? moodsWithBoth.reduce((sum, m) => sum + m.value, 0) / moodsWithBoth.length 
            : 0;

        // Simple correlation approximation
        const correlation = moodsWithBoth.length > 0 
            ? (avgBoth - Math.min(avg1, avg2)) / (Math.max(avg1, avg2) - Math.min(avg1, avg2))
            : 0;

        return Math.max(-1, Math.min(1, correlation));
    }

    // Therapist sharing
    generateTherapistCode() {
        // Generate a unique 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store encrypted data with code
        const shareData = {
            code: code,
            data: this.data,
            created: new Date().toISOString(),
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };

        // In a real app, this would be sent to a server
        localStorage.setItem(`therapist_share_${code}`, JSON.stringify(shareData));
        
        return code;
    }

    // Export data in various formats
    async exportData(format = 'json') {
        const exporters = {
            'json': () => this.exportJSON(),
            'csv': () => this.exportCSV(),
            'pdf': () => this.exportPDF(),
            'encrypted': () => this.exportEncrypted()
        };

        if (exporters[format]) {
            await exporters[format]();
        }
    }

    // Export as CSV
    exportCSV() {
        let csv = 'Date,Mood,Factors,Note\n';
        
        this.data.moods.forEach(mood => {
            const date = new Date(mood.date).toLocaleDateString();
            const factors = mood.factors.join(';');
            const note = mood.note ? `"${mood.note.replace(/"/g, '""')}"` : '';
            csv += `${date},${mood.value},${factors},${note}\n`;
        });

        this.downloadFile(csv, 'mindfulme_moods.csv', 'text/csv');
    }

    // Export as PDF (simplified version)
    exportPDF() {
        // In a real app, this would use a PDF library like jsPDF
        const report = this.generateReport();
        
        // For now, create an HTML report
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>MindfulMe Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #6366f1; }
                    .stat { margin: 10px 0; }
                    .chart { margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>MindfulMe Mental Health Report</h1>
                <p>Generated: ${new Date().toLocaleDateString()}</p>
                
                <h2>Summary Statistics</h2>
                <div class="stat">Average Mood: ${report.avgMood.toFixed(2)}/5</div>
                <div class="stat">Total Entries: ${report.totalEntries}</div>
                <div class="stat">Current Streak: ${report.streak} days</div>
                
                <h2>Top Mood Factors</h2>
                <ul>
                    ${report.topFactors.map(f => `<li>${f.factor}: ${f.count} times</li>`).join('')}
                </ul>
                
                <h2>Recommendations</h2>
                <ul>
                    ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url);
    }

    // Generate report
    generateReport() {
        const avgMood = this.data.moods.reduce((sum, m) => sum + m.value, 0) / this.data.moods.length;
        
        const factorCounts = {};
        this.data.moods.forEach(mood => {
            mood.factors.forEach(factor => {
                factorCounts[factor] = (factorCounts[factor] || 0) + 1;
            });
        });

        const topFactors = Object.entries(factorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([factor, count]) => ({ factor, count }));

        const recommendations = [];
        if (avgMood < 3) {
            recommendations.push('Consider reaching out to a mental health professional');
            recommendations.push('Try incorporating more exercise into your routine');
        }
        if (topFactors[0]?.factor === 'Stress') {
            recommendations.push('Explore stress management techniques like meditation');
        }

        return {
            avgMood,
            totalEntries: this.data.moods.length,
            streak: this.data.streak,
            topFactors,
            recommendations
        };
    }

    // Download file helper
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Get device ID
    getDeviceId() {
        let deviceId = localStorage.getItem('mindfulme_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('mindfulme_device_id', deviceId);
        }
        return deviceId;
    }
}

// Initialize advanced app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MindfulMeAdvanced();
    showPage('home');
});

// Service Worker for PWA (create separate sw.js file)
const swCode = `
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('mindfulme-v2').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/styles.css',
                '/js/app.js',
                '/manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
`;

// End of app.js

                    
