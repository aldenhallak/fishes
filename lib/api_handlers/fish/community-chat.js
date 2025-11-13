/**
 * Community Chat API Endpoint
 * 
 * Generates fish dialogue using COZE AI for the community chat feature.
 * Supports unified mode: generates both group conversations and individual musings.
 */

const { generateDialogue, generateFallbackDialogue, selectTopic } = require('../../lib/coze-client');
const { queryHasura } = require('../../lib/hasura');

/**
 * Save chat session to database
 * @param {Object} sessionData - Session data to save
 * @returns {Promise<string>} - Session ID
 */
async function saveChatSession(sessionData) {
  const mutation = `
    mutation SaveChatSession(
      $topic: String!
      $time_of_day: String
      $participant_fish_ids: [uuid!]!
      $dialogues: jsonb!
      $display_duration: Int!
    ) {
      insert_community_chat_sessions_one(
        object: {
          topic: $topic
          time_of_day: $time_of_day
          participant_fish_ids: $participant_fish_ids
          dialogues: $dialogues
          display_duration: $display_duration
        }
      ) {
        id
        created_at
      }
    }
  `;
  
  const variables = {
    topic: sessionData.topic,
    time_of_day: sessionData.time_of_day,
    participant_fish_ids: sessionData.participant_fish_ids,
    dialogues: sessionData.dialogues,
    display_duration: sessionData.display_duration
  };
  
  try {
    const result = await queryHasura(mutation, variables);
    return result.insert_community_chat_sessions_one.id;
  } catch (error) {
    console.error('Failed to save chat session:', error);
    throw error;
  }
}

/**
 * Main handler for community chat generation
 */
module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { topic, participants, useFallback } = req.body;
    
    // Validate input
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        error: 'participants array is required'
      });
    }
    
    if (participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 fish participants are required'
      });
    }
    
    // Validate each participant has required fields
    for (const fish of participants) {
      if (!fish.fishId || !fish.name) {
        return res.status(400).json({
          success: false,
          error: 'Each participant must have fishId and name'
        });
      }
    }
    
    // Auto-select topic if not provided
    const selectedTopic = topic || selectTopic();
    
    console.log('Generating community chat:', {
      topic: selectedTopic,
      participantCount: participants.length,
      fishNames: participants.map(p => p.name)
    });
    
    let dialogues;
    let usedFallback = false;
    
    try {
      // Try to generate dialogue with COZE AI
      if (useFallback) {
        throw new Error('Fallback requested');
      }
      
      dialogues = await generateDialogue(selectedTopic, participants);
      
    } catch (cozeError) {
      console.error('COZE generation failed, using fallback:', cozeError.message);
      
      // Use fallback dialogue
      dialogues = generateFallbackDialogue(participants);
      usedFallback = true;
    }
    
    // Add fishId to each dialogue (match by fishName)
    const enrichedDialogues = dialogues.map(d => {
      const fish = participants.find(p => p.name === d.fishName);
      return {
        ...d,
        fishId: fish ? fish.fishId : null
      };
    });
    
    // Calculate display duration (6 seconds per message)
    const displayDuration = enrichedDialogues.length * 6;
    
    // Prepare session data
    const sessionData = {
      topic: selectedTopic,
      time_of_day: new Date().getHours() >= 6 && new Date().getHours() < 12 
        ? 'morning' 
        : new Date().getHours() >= 12 && new Date().getHours() < 18 
        ? 'afternoon' 
        : new Date().getHours() >= 18 
        ? 'evening' 
        : 'night',
      participant_fish_ids: participants.map(p => p.fishId),
      dialogues: { messages: enrichedDialogues },
      display_duration: displayDuration
    };
    
    // Save to database
    let sessionId;
    try {
      sessionId = await saveChatSession(sessionData);
      console.log('Chat session saved:', sessionId);
    } catch (dbError) {
      console.error('Failed to save session, continuing anyway:', dbError);
      // Continue even if save fails - return dialogues to frontend
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      sessionId: sessionId || null,
      topic: selectedTopic,
      dialogues: enrichedDialogues,
      displayDuration: displayDuration,
      usedFallback: usedFallback,
      participantCount: participants.length
    });
    
  } catch (error) {
    console.error('Community chat generation error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate community chat',
      message: error.message
    });
  }
};

