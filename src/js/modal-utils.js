// Modal Utilities - Reusable modal components
// This file contains modal-related functionality that can be shared across the application

class ModalManager {
    constructor() {
        this.selectedFishId = null;
        this.userTanks = [];
    }

    // Show add to tank modal
    async showAddToTankModal(fishId) {
        const token = localStorage.getItem('userToken');
        if (!token) {
            this.showLoginPrompt();
            return;
        }
        
        this.selectedFishId = fishId;
        await this.loadUserTanks();
        
        // Ensure CSS is injected
        this.injectTankSelectionCSS();
        
        const html = this.createAddToTankHTML();
        const modal = this.createModal(html);
        
        // Add event listeners for tank selection
        modal.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-tank-btn')) {
                const tankId = e.target.getAttribute('data-tank-id');
                this.addFishToTank(tankId, modal.close);
            }
        });
    }

    // Inject tank selection CSS if not already present
    injectTankSelectionCSS() {
        // Check if CSS is already injected
        if (document.getElementById('tank-selection-css')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'tank-selection-css';
        style.textContent = `
            /* Tank selection in modal */
            .tank-selection-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 12px;
                max-height: 400px;
                overflow-y: auto;
                padding: 5px;
            }
            
            .tank-selection-item {
                border: 2px solid #e9ecef;
                border-radius: 12px;
                padding: 16px;
                background: white;
                transition: all 0.3s ease;
                cursor: pointer;
                position: relative;
            }
            
            .tank-selection-item:hover {
                border-color: #007bff;
                background: #f8f9fa;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
            }
            
            .tank-selection-item h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 1.1em;
                font-weight: 600;
            }
            
            .tank-selection-item .tank-description {
                margin: 0 0 8px 0;
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .tank-selection-stats {
                display: flex;
                gap: 15px;
                margin: 8px 0 12px 0;
                font-size: 13px;
                color: #666;
            }
            
            .tank-selection-stats .stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .tank-privacy-indicator {
                position: absolute;
                top: 12px;
                right: 12px;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .tank-privacy-indicator.public {
                background: #d4edda;
                color: #155724;
            }
            
            .tank-privacy-indicator.private {
                background: #f8d7da;
                color: #721c24;
            }
            
            .add-to-tank-btn {
                width: 100%;
                padding: 10px 16px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .add-to-tank-btn:hover {
                background: #0056b3;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 123, 255, 0.25);
            }
            
            .add-to-tank-btn:active {
                transform: translateY(0);
            }
            
            .no-tanks-message {
                text-align: center;
                padding: 40px 20px;
                color: #666;
                line-height: 1.6;
            }
            
            .no-tanks-message h3 {
                color: #333;
                font-size: 1.2em;
            }
            
            .no-tanks-message p {
                margin: 0 0 15px 0;
                line-height: 1.5;
            }
            
            .no-tanks-message .btn {
                display: inline-block;
                text-decoration: none;
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border-radius: 5px;
                transition: background 0.2s ease;
            }
            
            .no-tanks-message .btn:hover {
                background: #0056b3;
            }
            
            /* Special styling for add-to-tank modal */
            .modal-content.wide {
                width: 600px !important;
                max-width: 90vw;
            }
            
            /* Responsive design for tank selection modal */
            @media (max-width: 768px) {
                .modal-content.wide {
                    width: 95% !important;
                    margin: 50px auto;
                }
                
                .tank-selection-grid {
                    max-height: 300px;
                    gap: 10px;
                }
                
                .tank-selection-item {
                    padding: 12px;
                }
                
                .tank-selection-item h4 {
                    font-size: 1em;
                }
                
                .tank-selection-stats {
                    font-size: 12px;
                    gap: 12px;
                }
                
                .add-to-tank-btn {
                    padding: 8px 12px;
                    font-size: 13px;
                }
            }
            
            /* Notification toasts */
            .notification-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
                max-width: 300px;
                word-wrap: break-word;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // Load user's tanks
    async loadUserTanks() {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${BACKEND_URL}/api/fishtanks/my-tanks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load your tanks');
            }
            
            const data = await response.json();
            this.userTanks = data.fishtanks || [];
            
        } catch (err) {
            console.error('Error loading tanks:', err);
            alert('Failed to load your tanks. Please try again.');
        }
    }

    // Create add to tank modal HTML
    createAddToTankHTML() {
        let html = `
            <div style="text-align: center;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 1.5em;">Add Fish to Tank</h2>
                <p style="margin: 0 0 20px 0; color: #666;">Select a tank to add this fish to:</p>
        `;
        
        if (this.userTanks.length === 0) {
            html += `
                <div class="no-tanks-message">
                    <h3>No tanks found</h3>
                    <p>You don't have any tanks yet. Create your first tank to start collecting fish!</p>
                    <a href="fishtanks.html" class="btn">Create First Tank</a>
                </div>
            `;
        } else {
            html += `<div class="tank-selection-grid">`;
            
            this.userTanks.forEach(tank => {
                const privacyClass = tank.isPublic ? 'public' : 'private';
                const privacyText = tank.isPublic ? 'Public' : 'Private';
                
                html += `
                    <div class="tank-selection-item">
                        <div class="tank-privacy-indicator ${privacyClass}">${privacyText}</div>
                        <h4>${tank.name}</h4>
                        <p class="tank-description">${tank.description || 'No description provided'}</p>
                        <div class="tank-selection-stats">
                            <div class="stat-item">
                                <span>🐠</span>
                                <span>${tank.fishCount || 0} fish</span>
                            </div>
                            <div class="stat-item">
                                <span>👁️</span>
                                <span>${tank.viewCount || 0} views</span>
                            </div>
                        </div>
                        <button class="add-to-tank-btn" data-tank-id="${tank.id}">
                            Add to "${tank.name}"
                        </button>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `</div>`;
        return html;
    }

    // Add fish to selected tank
    async addFishToTank(tankId, closeModal) {
        if (!this.selectedFishId) return;
        
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${BACKEND_URL}/api/fishtanks/${tankId}/add-fish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fishId: this.selectedFishId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add fish to tank');
            }
            
            // Get tank name for better feedback
            const tank = this.userTanks.find(t => t.id === tankId);
            const tankName = tank ? tank.name : 'tank';
            
            this.showSuccessNotification(`Fish successfully added to "${tankName}"!`);
            closeModal();
            
        } catch (err) {
            console.error('Error adding fish to tank:', err);
            this.showErrorNotification('Failed to add fish to tank: ' + err.message);
        }
    }

    // Show login prompt
    showLoginPrompt() {
        const html = `
            <div style="text-align: center;">
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 1.5em;">Login Required</h2>
                <p style="margin: 0 0 15px 0; color: #666;">Login to add fish to your personal tank.</p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="login.html" style="padding: 8px 12px; border: 1px solid #ddd; background: #007bff; color: white; text-decoration: none; margin-right: 10px; border-radius: 5px; transition: all 0.2s ease;">Login / Sign Up</a>
                    <button onclick="this.closest('.modal').click()" style="border: 1px solid #ddd; background: white; padding: 8px 12px; cursor: pointer; border-radius: 5px; color: #666; transition: all 0.2s ease;">Maybe Later</button>
                </div>
            </div>
        `;
        
        this.createModal(html);
    }

    // Show success notification
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }
    
    // Show error notification
    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }
    
    // Show notification
    showNotification(message, type = 'success') {
        // Remove any existing notifications
        const existing = document.querySelectorAll('.notification-toast');
        existing.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2000;
            animation: slideInRight 0.3s ease-out;
            max-width: 350px;
            word-wrap: break-word;
        `;
        
        if (type === 'success') {
            notification.style.background = '#28a745';
            notification.style.color = 'white';
        } else {
            notification.style.background = '#dc3545';
            notification.style.color = 'white';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notification && notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }

    // Create modal using existing tank.js modal system
    createModal(html) {
        // Use the existing showModal function if available, otherwise create our own
        if (typeof showModal === 'function') {
            const modalResult = showModal(html, () => {
                this.selectedFishId = null;
            });
            
            // Check if this is a tank selection modal and add wide class
            if (html.includes('tank-selection-grid') || html.includes('Add Fish to Tank')) {
                const modalContent = modalResult.modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.add('wide');
                    // Override the width for tank selection
                    modalContent.style.width = '600px';
                    modalContent.style.maxWidth = '90vw';
                }
            }
            
            return modalResult;
        } else {
            // Fallback modal creation matching rank page design
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content wide'; // Add wide class for tank selection
            modalContent.style.cssText = 'background: white; margin: 100px auto; padding: 20px; width: auto; min-width: 300px; max-width: 90vw; max-height: 90vh; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); overflow: auto;';
            modalContent.innerHTML = html;
            
            modal.appendChild(modalContent);
            
            const close = () => {
                document.body.removeChild(modal);
                this.selectedFishId = null;
            };
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) close();
            });
            
            document.body.appendChild(modal);
            return { close, modal };
        }
    }
}

// Create a global instance
const modalManager = new ModalManager();

// Export functions for global use
window.showAddToTankModal = (fishId) => modalManager.showAddToTankModal(fishId);
window.closeAddToTankModal = () => {
    // Close any open modal by looking for modal elements
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
    modalManager.selectedFishId = null;
};
window.closeLoginPromptModal = () => {
    // Close any open modal by looking for modal elements
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
};