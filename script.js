
        // TaskFlow Pro - Complete Task Manager Application
        class TaskFlowPro {
            constructor() {
                this.tasks = [];
                this.settings = {
                    theme: 'light',
                    sound: true,
                    animations: true
                };
                this.currentPriority = 'high';
                this.soundEnabled = this.settings.sound;
                this.animationsEnabled = this.settings.animations;
                
                this.init();
                this.bindEvents();
                this.updateUI();
                this.startClock();
                this.createParticles();
                this.hideLoadingScreen();
            }

            init() {
                // Initialize theme
                if (this.settings.theme === 'dark') {
                    document.body.setAttribute('data-theme', 'dark');
                    const themeIcon = document.querySelector('#themeToggle i');
                    if (themeIcon) themeIcon.className = 'fas fa-sun';
                }

                // Initialize sound toggle
                if (!this.soundEnabled) {
                    const soundIcon = document.querySelector('#soundToggle i');
                    if (soundIcon) soundIcon.className = 'fas fa-volume-mute';
                }
            }

            hideLoadingScreen() {
                setTimeout(() => {
                    const loadingScreen = document.getElementById('loadingScreen');
                    if (loadingScreen) {
                        loadingScreen.classList.add('hidden');
                    }
                }, 1500);
            }

            bindEvents() {
                // Task input events
                const taskInput = document.getElementById('taskInput');
                const addBtn = document.getElementById('addBtn');
                
                if (taskInput) {
                    taskInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter' && taskInput.value.trim()) {
                            this.addTask();
                        }
                    });
                }

                if (addBtn) {
                    addBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (taskInput && taskInput.value.trim()) {
                            this.addTask();
                        }
                    });
                }

                // Priority selector events
                document.querySelectorAll('.priority-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        this.currentPriority = btn.dataset.priority;
                        this.playSound('click');
                    });
                });

                // Quick actions events
                document.querySelectorAll('.quick-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const taskText = btn.dataset.task;
                        if (taskText) {
                            this.addQuickTask(taskText);
                        }
                    });
                });

                // Control buttons
                const themeToggle = document.getElementById('themeToggle');
                const soundToggle = document.getElementById('soundToggle');
                const settingsToggle = document.getElementById('settingsToggle');

                if (themeToggle) {
                    themeToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.toggleTheme();
                    });
                }
                
                if (soundToggle) {
                    soundToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.toggleSound();
                    });
                }
                
                if (settingsToggle) {
                    settingsToggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showSettings();
                    });
                }
            }

            addTask(taskText = null) {
                const taskInput = document.getElementById('taskInput');
                const text = taskText || (taskInput ? taskInput.value.trim() : '');
                
                if (!text) return;

                const task = {
                    id: Date.now() + Math.random(),
                    text: text,
                    completed: false,
                    priority: this.currentPriority,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                };

                this.tasks.push(task);
                this.updateUI();
                this.showToast('Task added successfully!', 'success');
                this.playSound('add');
                
                if (!taskText && taskInput) {
                    taskInput.value = '';
                    taskInput.focus();
                }
                this.animateTaskAdd();
            }

            addQuickTask(text) {
                const task = {
                    id: Date.now() + Math.random(),
                    text: text,
                    completed: false,
                    priority: 'medium',
                    createdAt: new Date().toISOString(),
                    completedAt: null
                };

                this.tasks.push(task);
                this.updateUI();
                this.showToast('Quick task added!', 'success');
                this.playSound('add');
            }

            toggleTask(id) {
                const task = this.tasks.find(t => t.id == id);
                if (task) {
                    task.completed = !task.completed;
                    task.completedAt = task.completed ? new Date().toISOString() : null;
                    this.updateUI();
                    this.playSound(task.completed ? 'complete' : 'incomplete');
                    this.showToast(
                        task.completed ? 'Task completed! 🎉' : 'Task marked as pending',
                        task.completed ? 'success' : 'info'
                    );
                    
                    if (task.completed) {
                        this.triggerConfetti();
                    }
                }
            }

            deleteTask(id) {
                this.tasks = this.tasks.filter(t => t.id != id);
                this.updateUI();
                this.showToast('Task deleted', 'info');
                this.playSound('delete');
            }

            editTask(id) {
                const task = this.tasks.find(t => t.id == id);
                if (task) {
                    const newText = prompt('Edit task:', task.text);
                    if (newText && newText.trim()) {
                        task.text = newText.trim();
                        this.updateUI();
                        this.showToast('Task updated!', 'success');
                        this.playSound('edit');
                    }
                }
            }

            renderTasks() {
                const container = document.getElementById('tasksContainer');
                const emptyState = document.getElementById('emptyState');
                
                if (!container) return;
                
                if (this.tasks.length === 0) {
                    if (emptyState) {
                        emptyState.style.display = 'block';
                    }
                    container.innerHTML = '';
                    if (emptyState) {
                        container.appendChild(emptyState);
                    }
                    return;
                }

                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                const tasksHTML = this.tasks
                    .sort((a, b) => {
                        if (a.completed !== b.completed) {
                            return a.completed ? 1 : -1;
                        }
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    })
                    .map(task => this.createTaskHTML(task))
                    .join('');
                
                container.innerHTML = tasksHTML;
                
                // Add event listeners for tasks
                this.bindTaskEvents();
            }

            createTaskHTML(task) {
                return `
                    <div class="task-item ${task.completed ? 'completed' : ''}" data-priority="${task.priority}" data-id="${task.id}">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="window.todoApp.toggleTask('${task.id}')">
                            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                        </div>
                        <div class="task-priority" data-priority="${task.priority}"></div>
                        <div class="task-text">${this.escapeHtml(task.text)}</div>
                        <div class="task-actions">
                            <button class="task-action-btn edit-btn" onclick="window.todoApp.editTask('${task.id}')" title="Edit Task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="task-action-btn delete-btn" onclick="window.todoApp.deleteTask('${task.id}')" title="Delete Task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }

            bindTaskEvents() {
                // Add subtle animations to task items
                document.querySelectorAll('.task-item').forEach((item, index) => {
                    if (this.animationsEnabled) {
                        item.style.animationDelay = `${index * 0.1}s`;
                        item.style.animation = 'fade-in-up 0.5s ease-out forwards';
                    }
                });
            }

            updateUI() {
                this.renderTasks();
                this.updateStats();
                this.updateProgress();
            }

            updateStats() {
                const total = this.tasks.length;
                const completed = this.tasks.filter(t => t.completed).length;
                const pending = total - completed;
                const streak = this.calculateStreak();

                this.animateNumber('totalTasks', total);
                this.animateNumber('completedTasks', completed);
                this.animateNumber('pendingTasks', pending);
                this.animateNumber('streakCount', streak);
            }

            updateProgress() {
                const total = this.tasks.length;
                const completed = this.tasks.filter(t => t.completed).length;
                const percentage = total > 0 ? (completed / total) * 100 : 0;
                
                const progressFill = document.getElementById('progressFill');
                const achievementText = document.getElementById('achievementText');
                const achievementIcon = document.getElementById('achievementIcon');
                
                if (progressFill) {
                    progressFill.style.width = `${percentage}%`;
                }
                
                // Update achievement message
                if (achievementText && achievementIcon) {
                    if (percentage === 100 && total > 0) {
                        achievementText.textContent = "Perfect! All tasks completed! 🎉";
                        achievementIcon.textContent = "🏆";
                    } else if (percentage >= 80) {
                        achievementText.textContent = "Excellent progress! Keep going! ⭐";
                        achievementIcon.textContent = "⭐";
                    } else if (percentage >= 50) {
                        achievementText.textContent = "Great work! You're halfway there! 💪";
                        achievementIcon.textContent = "💪";
                    } else if (percentage > 0) {
                        achievementText.textContent = "Good start! Keep building momentum! 🚀";
                        achievementIcon.textContent = "🚀";
                    } else {
                        achievementText.textContent = "Ready to conquer your tasks!";
                        achievementIcon.textContent = "🚀";
                    }
                }
            }

            calculateStreak() {
                // Simple streak calculation - days with completed tasks
                const today = new Date().toDateString();
                const completedToday = this.tasks.some(t => 
                    t.completed && new Date(t.completedAt).toDateString() === today
                );
                return completedToday ? 1 : 0; // Simplified for demo
            }

            animateNumber(elementId, targetNumber) {
                const element = document.getElementById(elementId);
                if (!element) return;
                
                const currentNumber = parseInt(element.textContent) || 0;
                const increment = targetNumber > currentNumber ? 1 : -1;
                const duration = 50;

                if (currentNumber === targetNumber) return;

                const timer = setInterval(() => {
                    const current = parseInt(element.textContent) || 0;
                    if ((increment > 0 && current >= targetNumber) || (increment < 0 && current <= targetNumber)) {
                        element.textContent = targetNumber;
                        clearInterval(timer);
                    } else {
                        element.textContent = current + increment;
                    }
                }, duration);
            }

            animateTaskAdd() {
                if (this.animationsEnabled) {
                    const container = document.getElementById('tasksContainer');
                    if (container) {
                        container.style.transform = 'scale(1.02)';
                        setTimeout(() => {
                            container.style.transform = 'scale(1)';
                        }, 200);
                    }
                }
            }

            startClock() {
                const updateClock = () => {
                    const now = new Date();
                    const timeString = now.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                    const dateString = now.toLocaleDateString();
                    const timeDisplay = document.getElementById('timeDisplay');
                    if (timeDisplay) {
                        timeDisplay.innerHTML = `
                            <div style="font-size: 1.2em; margin-bottom: 4px;">${timeString}</div>
                            <div style="font-size: 0.9em; opacity: 0.8;">${dateString}</div>
                        `;
                    }
                };
                
                updateClock();
                setInterval(updateClock, 1000);
            }

            createParticles() {
                const container = document.getElementById('particles-container');
                if (!container) return;
                
                const particleCount = 15;
                
                for (let i = 0; i < particleCount; i++) {
                    setTimeout(() => {
                        this.createParticle(container);
                    }, i * 800);
                }
                
                setInterval(() => {
                    this.createParticle(container);
                }, 3000);
            }

            createParticle(container) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 20000);
            }

            toggleTheme() {
                const currentTheme = document.body.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.body.setAttribute('data-theme', newTheme);
                this.settings.theme = newTheme;
                
                const themeIcon = document.querySelector('#themeToggle i');
                if (themeIcon) {
                    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
                
                this.showToast(`Switched to ${newTheme} theme`, 'info');
                this.playSound('click');
            }

            toggleSound() {
                this.soundEnabled = !this.soundEnabled;
                this.settings.sound = this.soundEnabled;
                
                const soundIcon = document.querySelector('#soundToggle i');
                if (soundIcon) {
                    soundIcon.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
                }
                
                this.showToast(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`, 'info');
                if (this.soundEnabled) this.playSound('click');
            }

            showSettings() {
                this.showToast('Settings feature - Advanced options coming soon!', 'info');
                this.playSound('click');
            }

            playSound(type) {
                if (!this.soundEnabled) return;
                
                // Create audio context and play simple tones
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    let frequency = 440;
                    let duration = 0.1;
                    
                    switch(type) {
                        case 'add':
                            frequency = 600;
                            duration = 0.15;
                            break;
                        case 'complete':
                            frequency = 800;
                            duration = 0.2;
                            break;
                        case 'delete':
                            frequency = 300;
                            duration = 0.1;
                            break;
                        case 'click':
                            frequency = 500;
                            duration = 0.05;
                            break;
                        case 'edit':
                            frequency = 650;
                            duration = 0.1;
                            break;
                        case 'incomplete':
                            frequency = 400;
                            duration = 0.1;
                            break;
                    }
                    
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (e) {
                    console.log('Audio not supported');
                }
            }

            showToast(message, type = 'info') {
                const container = document.getElementById('toastContainer');
                if (!container) return;
                
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                
                const icon = type === 'success' ? 'fa-check-circle' : 
                            type === 'error' ? 'fa-exclamation-circle' : 
                            'fa-info-circle';
                
                toast.innerHTML = `
                    <i class="fas ${icon}"></i>
                    <span>${message}</span>
                `;
                
                container.appendChild(toast);
                
                // Auto remove after 3 seconds
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.style.animation = 'toast-out 0.4s ease-in forwards';
                        setTimeout(() => {
                            if (toast.parentNode) {
                                toast.parentNode.removeChild(toast);
                            }
                        }, 400);
                    }
                }, 3000);
            }

            triggerConfetti() {
                if (!this.animationsEnabled) return;
                
                // Create simple confetti effect
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
                const confettiCount = 30;
                
                for (let i = 0; i < confettiCount; i++) {
                    setTimeout(() => {
                        this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
                    }, i * 20);
                }
            }

            createConfettiPiece(color) {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = confetti.style.height = Math.random() * 8 + 4 + 'px';
                confetti.style.background = color;
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                
                document.body.appendChild(confetti);
                
                const animation = confetti.animate([
                    {
                        transform: 'translateY(0) rotate(0deg)',
                        opacity: 1
                    },
                    {
                        transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`,
                        opacity: 0
                    }
                ], {
                    duration: Math.random() * 2000 + 1500,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                animation.addEventListener('finish', () => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                });
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // Initialize app when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Make sure all required elements exist before initializing
            const requiredElements = ['taskInput', 'addBtn', 'tasksContainer', 'timeDisplay'];
            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            
            if (missingElements.length > 0) {
                console.error('Missing required elements:', missingElements);
                return;
            }

            // Initialize the app
            window.todoApp = new TaskFlowPro();
            console.log('🚀 TaskFlow Pro initialized successfully!');
        });

        // Add visual feedback for interactions
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.control-btn, .add-btn, .quick-btn, .task-action-btn, .priority-btn');
            if (button) {
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);

                // Add ripple effect
                if (window.todoApp && window.todoApp.animationsEnabled) {
                    const ripple = document.createElement('span');
                    ripple.classList.add('ripple');
                    button.appendChild(ripple);
                    
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = x + 'px';
                    ripple.style.top = y + 'px';
                    
                    setTimeout(() => {
                        if (ripple.parentNode) {
                            ripple.remove();
                        }
                    }, 600);
                }
            }
        });

        // Prevent form submission on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('.task-input')) {
                e.preventDefault();
            }
        });

        // Add error handling
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
        });

        // Add unhandled promise rejection handling
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
        });
   