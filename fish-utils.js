// Shared utilities for fish functionality across tank.js and rank.js
// This file contains common functions to avoid code duplication

// Configuration for backend URL - change to false for local development
const USE_PRODUCTION_BACKEND = true;
const BACKEND_URL = USE_PRODUCTION_BACKEND 
    ? 'https://fishes-be-571679687712.northamerica-northeast1.run.app'
    : 'http://localhost:8080';

// Calculate fish score (upvotes - downvotes)
function calculateScore(fish) {
    const upvotes = fish.upvotes || 0;
    const downvotes = fish.downvotes || 0;
    return upvotes - downvotes;
}

// Send vote to endpoint
async function sendVote(fishId, voteType) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fishId: fishId,
                vote: voteType // 'up' or 'down'
            })
        });
        
        if (!response.ok) {
            console.error(`Vote failed with status: ${response.status}`);
            throw new Error(`Vote failed with status: ${response.status}`);
        }
        
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error sending vote:', error);
        throw error;
    }
}

// Send report to endpoint
async function sendReport(fishId, reason) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fishId: fishId,
                reason: reason.trim(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error submitting report:', error);
        throw error;
    }
}

// Generic vote handler that can be used by both tank and rank
async function handleVoteGeneric(fishId, voteType, button, updateCallback) {
    // Disable button temporarily
    button.disabled = true;
    button.style.opacity = '0.6';
    
    try {
        const result = await sendVote(fishId, voteType);
        
        // Call the provided update callback with the result
        if (updateCallback) {
            updateCallback(result, voteType);
        }
        
        // Show success feedback
        button.style.backgroundColor = voteType === 'up' ? '#4CAF50' : '#f44336';
        setTimeout(() => {
            button.style.backgroundColor = '';
        }, 1000);
        
    } catch (error) {
        console.error('Vote failed:', error);
        alert('Voting failed. Please try again.');
    }
    
    // Re-enable button
    setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
    }, 1000);
}

// Generic report handler that can be used by both tank and rank
async function handleReportGeneric(fishId, button) {
    try {
        const reason = prompt('Please provide a reason for reporting this fish:');
        
        if (!reason || reason.trim() === '') {
            return; // User cancelled or entered empty reason
        }
        
        // Disable button immediately
        button.disabled = true;
        button.style.opacity = '0.6';
        
        const result = await sendReport(fishId, reason);
        
        if (result.success) {
            alert('Report submitted successfully. Thank you for helping keep our community safe!');
            
            // Update button to show success
            button.textContent = '✅';
            button.title = 'Report submitted';
            button.style.opacity = '1';
            button.style.backgroundColor = '#4CAF50';
            
            // Keep button disabled to prevent duplicate reports
            setTimeout(() => {
                button.textContent = '🚩';
                button.title = 'Report inappropriate content';
                button.style.backgroundColor = '';
                button.disabled = false;
                button.style.opacity = '1';
            }, 10000); // 10 second cooldown
            
        } else {
            throw new Error(result.message || 'Report submission failed');
        }
        
    } catch (error) {
        console.error('Error submitting report:', error);
        
        // Re-enable button on error
        button.disabled = false;
        button.style.opacity = '1';
        
        alert('Error submitting report. Please try again later.');
    }
}

// Format date for display (shared utility)
function formatDate(dateValue) {
    if (!dateValue) return 'Unknown date';
    
    let dateObj;
    if (typeof dateValue === 'string') {
        dateObj = new Date(dateValue);
    } else if (typeof dateValue.toDate === 'function') {
        dateObj = dateValue.toDate();
    } else {
        dateObj = dateValue;
    }
    
    if (isNaN(dateObj)) return 'Unknown date';
    
    return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Create voting controls HTML (shared utility)
function createVotingControlsHTML(fishId, upvotes = 0, downvotes = 0, includeScore = false, cssClass = '') {
    const score = upvotes - downvotes;
    let html = `<div class="voting-controls ${cssClass}" style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:15px;">`;
    
    if (includeScore) {
        html += `<span class="fish-score">Score: ${score}</span>`;
    }
    
    html += `<button class="vote-btn upvote-btn" onclick="handleVote('${fishId}', 'up', this)" title="Upvote this fish">`;
    html += `👍 <span class="vote-count upvote-count">${upvotes}</span>`;
    html += `</button>`;
    html += `<button class="vote-btn downvote-btn" onclick="handleVote('${fishId}', 'down', this)" title="Downvote this fish">`;
    html += `👎 <span class="vote-count downvote-count">${downvotes}</span>`;
    html += `</button>`;
    html += `<button class="report-btn" onclick="handleReport('${fishId}', this)" title="Report inappropriate content">`;
    html += `🚩`;
    html += `</button>`;
    html += `</div>`;
    
    return html;
}