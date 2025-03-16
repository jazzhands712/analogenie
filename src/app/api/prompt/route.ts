import { NextApiRequest, NextApiResponse } from 'next';
import { processPrompt } from '@/lib/api-service';
import { validateConcept } from '@/lib/error-handling';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { stage, concept, domain, finding, sessionId } = req.body;
    
    // Validate required parameters
    if (!stage || !concept) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Validate concept length
    const validation = validateConcept(concept);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message });
    }
    
    // Validate stage-specific parameters
    if (stage >= 2 && !domain) {
      return res.status(400).json({ error: 'Domain is required for stage 2 and above' });
    }
    
    if (stage >= 3 && !finding) {
      return res.status(400).json({ error: 'Finding is required for stage 3' });
    }
    
    // Process the prompt
    const result = await processPrompt(stage, {
      concept,
      domain,
      finding,
      sessionId
    });
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error processing prompt:', error);
    res.status(500).json({ 
      error: 'Failed to process prompt',
      message: error.message 
    });
  }
}
