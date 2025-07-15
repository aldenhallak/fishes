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
                <h2 style="margin: 0 0 15px 0; color: #333; font-size: 1.5em;">Add Fish to Tank</h2>
                <p style="margin: 0 0 15px 0; color: #666;">Select a tank to add this fish to:</p>
        `;
        
        if (this.userTanks.length === 0) {
            html += `
                <div style="padding: 15px; text-align: center; border: 2px solid #ddd; border-radius: 10px; background: #f8f9fa;">
                    <p style="margin: 0 0 10px 0; color: #666;">You don't have any tanks yet.</p>
                    <a href="fishtanks.html" style="padding: 8px 12px; border: 1px solid #ddd; background: white; text-decoration: none; display: inline-block; margin-top: 8px; border-radius: 5px; color: #007bff; transition: all 0.2s ease;">Create First Tank</a>
                </div>
            `;
        } else {
            this.userTanks.forEach(tank => {
                html += `
                    <div style="padding: 15px; margin: 10px 0; border: 2px solid #ddd; border-radius: 10px; text-align: left; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h4 style="margin: 0 0 5px 0; color: #333; font-size: 1.1em;">${tank.name}</h4>
                        <p style="margin: 5px 0; color: #666; font-size: 0.9em;">${tank.description || 'No description'}</p>
                        <p style="margin: 5px 0; color: #666; font-size: 0.85em;">Fish: ${tank.fishCount || 0} | Privacy: ${tank.isPublic ? 'Public' : 'Private'}</p>
                        <button class="add-to-tank-btn" data-tank-id="${tank.id}" style="border: 1px solid #ddd; background: white; padding: 8px 12px; cursor: pointer; margin-top: 8px; border-radius: 5px; color: #007bff; transition: all 0.2s ease; font-size: 0.9em;">Add to Tank</button>
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

    // Create modal using existing tank.js modal system
    createModal(html) {
        // Use the existing showModal function if available, otherwise create our own
        if (typeof showModal === 'function') {
            return showModal(html, () => {
                this.selectedFishId = null;
            });
        } else {
            // Fallback modal creation matching rank page design
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = 'position: fixed; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
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