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
            // TODO: Enable
            // this.showLoginPrompt();
            return;
        }
        
        this.selectedFishId = fishId;
        await this.loadUserTanks();
        
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
                <h2 style="margin: 0 0 15px 0;">Add Fish to Tank</h2>
                <p style="margin: 0 0 15px 0;">Select a tank to add this fish to:</p>
        `;
        
        if (this.userTanks.length === 0) {
            html += `
                <div style="padding: 15px; text-align: center; border: 1px solid #000;">
                    <p>You don't have any tanks yet.</p>
                    <a href="fishtanks.html" style="padding: 4px 8px; border: 1px solid #000; text-decoration: none; display: inline-block; margin-top: 8px;">Create First Tank</a>
                </div>
            `;
        } else {
            this.userTanks.forEach(tank => {
                html += `
                    <div style="padding: 8px; margin: 8px 0; border: 1px solid #000; text-align: left;">
                        <h4 style="margin: 0 0 3px 0;">${tank.name}</h4>
                        <p style="margin: 3px 0;">${tank.description || 'No description'}</p>
                        <p style="margin: 3px 0;">Fish: ${tank.fishCount || 0} | Privacy: ${tank.isPublic ? 'Public' : 'Private'}</p>
                        <button class="add-to-tank-btn" data-tank-id="${tank.id}" style="border: 1px solid #000; padding: 2px 6px; cursor: pointer; margin-top: 3px;">Add to Tank</button>
                    </div>
                `;
            });
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
            
            alert('Fish added to tank successfully!');
            closeModal();
            
        } catch (err) {
            console.error('Error adding fish to tank:', err);
            alert('Failed to add fish to tank: ' + err.message);
        }
    }

    // Show login prompt
    showLoginPrompt() {
        const html = `
            <div style="text-align: center;">
                <h2 style="margin: 0 0 15px 0;">Login Required</h2>
                <p style="margin: 0 0 15px 0;">Login to add fish to your personal tank and create your own aquatic collection!</p>
                <p style="margin: 0 0 15px 0;">
                    Once you're logged in, you can click on any fish to add it to your personal tank!
                </p>
                <div style="text-align: center;">
                    <a href="login.html" style="padding: 4px 8px; border: 1px solid #000; text-decoration: none; margin-right: 5px;">Login / Sign Up</a>
                    <button onclick="this.closest('.modal-overlay').click()" style="border: 1px solid #000; padding: 4px 8px; cursor: pointer;">Maybe Later</button>
                </div>
            </div>
        `;
        
        this.createModal(html);
    }

    // Create modal using existing tank.js modal system
    createModal(html) {
        // Use the existing showModal function if available, otherwise create our own
        if (typeof showModal === 'function') {
            return showModal(html, () => {
                this.selectedFishId = null;
            });
        } else {
            // Fallback modal creation
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = 'position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
            modal.innerHTML = `<div style="background:white;padding:15px;border: 1px solid #000;min-width:300px;max-width:90vw;max-height:90vh;overflow:auto;">${html}</div>`;
            
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