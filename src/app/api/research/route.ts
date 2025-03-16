import { NextApiRequest, NextApiResponse } from 'next';
import { sendToResearchApi } from '@/lib/api-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { questions, apiProvider, sessionId } = req.body;
    
    // Validate required parameters
    if (!questions || !questions.length) {
      return res.status(400).json({ error: 'At least one research question is required' });
    }
    
    if (!apiProvider || !['perplexity', 'elicit'].includes(apiProvider)) {
      return res.status(400).json({ error: 'Valid API provider is required' });
    }
    
    // Send to research API
    const result = await sendToResearchApi(questions, apiProvider, sessionId);
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error sending to research API:', error);
    res.status(500).json({ 
      error: 'Failed to submit research questions',
      message: error.message 
    });
  }
}
