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
    const { witnessId, question, caseData, examinationType } = await req.json();
    
    // Generate realistic witness responses based on witness type and question
    let response = '';
    let credibilityImpact = 0;
    
    // Analyze question for objection potential
    const questionLower = question.toLowerCase();
    let objectionRisk = 0;
    
    if (questionLower.includes('isn\'t it true') || questionLower.includes('you did')) {
      objectionRisk += 30; // Leading question
    }
    
    if (questionLower.includes('what did someone say') || questionLower.includes('told you')) {
      objectionRisk += 40; // Hearsay
    }
    
    if (questionLower.includes('what do you think') || questionLower.includes('in your opinion')) {
      objectionRisk += 20; // Opinion testimony
    }
    
    // Generate response based on witness type
    switch (witnessId) {
      case 'defendant':
        if (examinationType === 'cross') {
          response = 'I understand your question, but I need to be clear about what actually happened. I was not involved in this incident as described.';
          credibilityImpact = -5;
        } else {
          response = 'Yes, I can explain my side of the story. On that day, I was...';
          credibilityImpact = 5;
        }
        break;
        
      case 'detective':
        if (questionLower.includes('evidence') || questionLower.includes('investigate')) {
          response = 'Based on my investigation and the evidence we collected, I can confirm that we followed proper procedures. The evidence clearly shows...';
          credibilityImpact = 10;
        } else {
          response = 'Yes, I documented everything in my report. According to our investigation...';
          credibilityImpact = 8;
        }
        break;
        
      case 'forensic':
        if (questionLower.includes('analysis') || questionLower.includes('test')) {
          response = 'Our forensic analysis using standard laboratory procedures revealed that the evidence is consistent with...';
          credibilityImpact = 12;
        } else {
          response = 'From a scientific standpoint, the evidence supports the conclusion that...';
          credibilityImpact = 10;
        }
        break;
        
      case 'victim':
        if (examinationType === 'cross') {
          response = 'I know this is difficult, but I\'m telling the truth about what happened to me.';
          credibilityImpact = -3;
        } else {
          response = 'It\'s hard to talk about, but I remember clearly what happened that day...';
          credibilityImpact = 7;
        }
        break;
        
      case 'eyewitness':
        if (questionLower.includes('see') || questionLower.includes('observe')) {
          response = 'I saw what happened from where I was standing. The lighting was good and I had a clear view...';
          credibilityImpact = 6;
        } else {
          response = 'Yes, I was there and I saw the incident occur.';
          credibilityImpact = 5;
        }
        break;
        
      default:
        response = 'Yes, I can answer that question to the best of my ability.';
        credibilityImpact = 0;
    }
    
    // Add some variation to responses
    const responseVariations = [
      response,
      `Well, ${response.toLowerCase()}`,
      `To be honest, ${response.toLowerCase()}`,
      `From what I remember, ${response.toLowerCase()}`
    ];
    
    const finalResponse = responseVariations[Math.floor(Math.random() * responseVariations.length)];
    
    // Determine if objection should be triggered
    const shouldTriggerObjection = objectionRisk > 50 && Math.random() < 0.7;
    
    return new Response(JSON.stringify({
      data: {
        response: finalResponse,
        credibilityImpact,
        objectionRisk,
        shouldTriggerObjection,
        suggestedObjection: shouldTriggerObjection ? 
          (objectionRisk > 60 ? 'leading' : 'relevance') : null
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        code: 'WITNESS_INTERACTION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});