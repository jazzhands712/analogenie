import { NextRequest, NextResponse } from 'next/server';
import { sendToResearchApi } from '@/lib/api-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions, apiProvider, sessionId } = body;
    
    // Validate required parameters
    if (!questions || !questions.length) {
      return NextResponse.json({ error: 'At least one research question is required' }, { status: 400 });
    }
    
    if (!apiProvider || !['perplexity', 'elicit'].includes(apiProvider)) {
      return NextResponse.json({ error: 'Valid API provider is required' }, { status: 400 });
    }
    
    // Send to research API
    const result = await sendToResearchApi(questions, apiProvider, sessionId);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending to research API:', error);
    return NextResponse.json({ 
      error: 'Failed to submit research questions',
      message: error.message 
    }, { status: 500 });
  }
}
