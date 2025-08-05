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
    const { gameSessionId, arguments, evidence, caseData } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Generate AI verdict based on arguments and evidence
    const prosecutorArgs = arguments.prosecutor || [];
    const defenseArgs = arguments.defense || [];
    const judgeComments = arguments.judge || [];
    
    // Simple AI logic for demonstration
    const prosecutorScore = Math.min(95, 50 + (prosecutorArgs.length * 10) + (evidence.length * 5));
    const defenseScore = Math.min(95, 50 + (defenseArgs.length * 10) + (evidence.length * 3));
    const judgeScore = Math.min(95, 70 + (judgeComments.length * 5));
    
    // Determine verdict based on scores and case type
    const totalProsecution = prosecutorScore + (evidence.length * 2);
    const totalDefense = defenseScore + 10; // Slight defense bias for realistic outcomes
    
    const verdict = totalProsecution > totalDefense ? 
      (caseData.case_type === 'criminal' ? 'GUILTY' : 'LIABLE') :
      (caseData.case_type === 'criminal' ? 'NOT GUILTY' : 'NOT LIABLE');
    
    const reasoning = `After careful deliberation of all arguments and evidence presented, the jury finds that ${
      verdict.includes('GUILTY') || verdict.includes('LIABLE') ? 
        'the prosecution has met their burden of proof. The evidence and arguments presented were compelling and sufficient to establish' :
        'the defense has successfully raised reasonable doubt. The prosecution did not meet their burden of proof, and'
    } the case requirements. Key factors in our decision included the quality of arguments presented, the relevance of evidence, and the overall strength of each side's case.`;
    
    const educationalInsights = `This case demonstrates important legal principles including ${
      caseData.case_type === 'criminal' ? 'the burden of proof beyond reasonable doubt' : 'the preponderance of evidence standard'
    }. Players should note how effective legal arguments combine factual evidence with persuasive reasoning. The presentation of evidence and the ability to address counterarguments were crucial elements in this trial.`;
    
    const verdictData = {
      verdict,
      reasoning,
      playerScores: {
        prosecutor: prosecutorScore,
        defense: defenseScore,
        judge: judgeScore
      },
      educationalInsights,
      caseAnalysis: {
        strengthOfCase: totalProsecution > totalDefense ? 'prosecution' : 'defense',
        keyFactors: ['argument quality', 'evidence presentation', 'legal reasoning'],
        verdict_confidence: Math.abs(totalProsecution - totalDefense) > 20 ? 'high' : 'moderate'
      }
    };
    
    // Store evaluation in database
    const apiUrl = `${supabaseUrl}/rest/v1`;
    const headers = {
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'apikey': serviceKey
    };
    
    await fetch(`${apiUrl}/ai_jury_evaluations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        game_session_id: gameSessionId,
        evaluation_phase: 'final_verdict',
        evaluation_data: {
          fullResponse: verdictData,
          arguments_analyzed: arguments,
          evidence_reviewed: evidence
        },
        confidence_score: verdictData.caseAnalysis.verdict_confidence === 'high' ? 0.85 : 0.65
      })
    });
    
    return new Response(JSON.stringify({
      data: verdictData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        code: 'AI_JURY_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});