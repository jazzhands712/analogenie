import { NextRequest, NextResponse } from 'next/server';
import { processPrompt, PromptResponse } from '@/lib/api-service';
import { validateConcept } from '@/lib/error-handling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage, concept, domain, finding, sessionId } = body;
    
    // Validate required parameters
    if (!stage || !concept) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Validate concept length
    const validation = validateConcept(concept);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }
    
    // Validate stage-specific parameters
    if (stage >= 2 && !domain) {
      return NextResponse.json({ error: 'Domain is required for stage 2 and above' }, { status: 400 });
    }
    
    if (stage >= 3 && !finding) {
      return NextResponse.json({ error: 'Finding is required for stage 3' }, { status: 400 });
    }
    
    // Process the prompt
    const result: PromptResponse = await processPrompt(stage, {
      concept,
      domain,
      finding,
      sessionId
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing prompt:', error);
    return NextResponse.json({ 
      error: 'Failed to process prompt',
      message: error.message 
    }, { status: 500 });
  }
}
