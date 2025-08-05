Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, userId, data, gameSessionId } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const apiUrl = `${supabaseUrl}/rest/v1`;
    const headers = {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'apikey': serviceKey
    };

    if (action === 'create_game') {
      // Generate room code
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create game session
      const gameResponse = await fetch(`${apiUrl}/game_sessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          room_code: roomCode,
          host_user_id: userId,
          current_phase: 'lobby',
          max_players: data.maxPlayers || 3,
          is_active: true,
          game_settings: {
            allowSpectators: data.allowSpectators || false,
            selectedCase: data.preSelectedCase,
            selectedCaseId: data.selectedCaseId,
            timeLimit: data.timeLimit || 300
          }
        })
      });
      
      if (!gameResponse.ok) {
        const error = await gameResponse.text();
        throw new Error(`Failed to create game: ${error}`);
      }
      
      const gameSession = await gameResponse.json();
      const newGame = gameSession[0];
      
      // Add host as participant
      await fetch(`${apiUrl}/game_participants`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          game_session_id: newGame.id,
          user_id: userId,
          role: data.preferredRole || 'judge',
          is_connected: true,
          join_order: 1
        })
      });
      
      return new Response(JSON.stringify({
        data: {
          gameSession: newGame,
          selectedCase: data.preSelectedCase
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'join_game') {
      // Find game by room code
      const gameResponse = await fetch(`${apiUrl}/game_sessions?room_code=eq.${data.roomCode}`, {
        headers
      });
      
      if (!gameResponse.ok) {
        throw new Error('Game not found');
      }
      
      const games = await gameResponse.json();
      if (games.length === 0) {
        throw new Error('Game not found');
      }
      
      const gameSession = games[0];
      
      // Get current participants
      const participantsResponse = await fetch(`${apiUrl}/game_participants?game_session_id=eq.${gameSession.id}`, {
        headers
      });
      const participants = await participantsResponse.json();
      
      // Determine available role
      const takenRoles = participants.map(p => p.role);
      const availableRoles = ['judge', 'prosecutor', 'defense'].filter(role => !takenRoles.includes(role));
      const assignedRole = data.preferredRole && availableRoles.includes(data.preferredRole) 
        ? data.preferredRole 
        : availableRoles[0] || 'spectator';
      
      // Add participant
      await fetch(`${apiUrl}/game_participants`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          game_session_id: gameSession.id,
          user_id: userId,
          role: assignedRole,
          is_connected: true,
          join_order: participants.length + 1
        })
      });
      
      // Get updated participants
      const updatedParticipantsResponse = await fetch(`${apiUrl}/game_participants?game_session_id=eq.${gameSession.id}`, {
        headers
      });
      const updatedParticipants = await updatedParticipantsResponse.json();
      
      return new Response(JSON.stringify({
        data: {
          gameSession,
          assignedRole,
          participants: updatedParticipants
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'advance_phase') {
      const phaseOrder = ['lobby', 'opening_statements', 'evidence_presentation', 'witness_examination', 'closing_arguments', 'deliberation', 'verdict'];
      const currentIndex = phaseOrder.indexOf(data.currentPhase);
      const nextPhase = phaseOrder[currentIndex + 1] || 'completed';
      
      // Update game session
      const updateResponse = await fetch(`${apiUrl}/game_sessions?id=eq.${gameSessionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          current_phase: nextPhase,
          updated_at: new Date().toISOString()
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to advance phase');
      }
      
      return new Response(JSON.stringify({
        data: {
          newPhase: nextPhase,
          timeLimit: 300
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    throw new Error(`Unknown action: ${action}`);
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        code: 'GAME_SESSION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});