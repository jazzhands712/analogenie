import { Anthropic } from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// System prompts for each stage
const SYSTEM_PROMPTS = {
  1: process.env.SYSTEM_PROMPT_1 || '',
  2: process.env.SYSTEM_PROMPT_2 || '',
  3: process.env.SYSTEM_PROMPT_3 || '',
};

// Claude model to use
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

// Define response types
export interface PromptResponse {
  type: string;
  content: string;
  options: any[];
  rawResponse?: string;
}

/**
 * Process a prompt through the Claude API
 * @param stage - Current workflow stage (1-3)
 * @param params - Parameters including concept, domain, finding, and sessionId
 * @returns Structured response from Claude
 */
export async function processPrompt(stage: number, params: {
  concept: string;
  domain?: string;
  finding?: string;
  sessionId: string;
}): Promise<PromptResponse> {
  const { concept, domain, finding } = params;
  
  // Get the appropriate system prompt for this stage
  let systemPrompt = SYSTEM_PROMPTS[stage as keyof typeof SYSTEM_PROMPTS];
  let userPrompt = '';
  
  // Prepare the prompts based on stage
  switch(stage) {
    case 1:
      // Domain Selection - only needs concept
      systemPrompt = systemPrompt.replace('[CONCEPT]', concept);
      userPrompt = `Please analyze the concept: "${concept}"`;
      break;
      
    case 2:
      // Conceptual Blending - needs concept and domain
      if (!domain) throw new Error('Domain is required for stage 2');
      
      systemPrompt = systemPrompt
        .replace(/\{\{CONCEPT\}\}/g, concept)
        .replace(/\{\{DOMAIN\}\}/g, domain);
      userPrompt = `Please analyze the relationship between ${concept} and ${domain}`;
      break;
      
    case 3:
      // Hypothesis Generation - needs concept, domain, and findings
      if (!domain) throw new Error('Domain is required for stage 3');
      if (!finding) throw new Error('Finding is required for stage 3');
      
      systemPrompt = systemPrompt
        .replace(/\{\{CONCEPT\}\}/g, concept)
        .replace(/\{\{DOMAIN\}\}/g, domain)
        .replace(/\{\{FINDINGS\}\}/g, finding);
      userPrompt = `Please develop hypotheses and research questions based on the selected framework`;
      break;
      
    default:
      throw new Error('Invalid stage specified');
  }
  
  // Call Claude API
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 4000
    });
    
    // Parse the response based on stage
    const parsedResponse = parseResponse(stage, response.content[0].text);
    
    return {
      ...parsedResponse,
      rawResponse: response.content[0].text
    };
    
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

/**
 * Parse Claude's response based on the current stage
 * @param stage - Current workflow stage
 * @param content - Text response from Claude
 * @returns Structured data for the UI
 */
function parseResponse(stage: number, content: string): PromptResponse {
  switch(stage) {
    case 1:
      // Parse domain options
      return parseDomainResponse(content);
    case 2:
      // Parse framework options
      return parseFrameworkResponse(content);
    case 3:
      // Parse research questions
      return parseResearchResponse(content);
    default:
      return { type: 'raw', content, options: [] };
  }
}

/**
 * Parse domain selection response from stage 1
 * @param content - Text response from Claude
 * @returns Structured domain options
 */
function parseDomainResponse(content: string): PromptResponse {
  // Extract the top domains section
  const domainsSection = content.match(/# Top Domains for Analyzing.*?(?=Which domain should we explore further\?|$)/s);
  
  if (!domainsSection) {
    return { type: 'domain_selection', content, options: [] };
  }
  
  // Extract domains using regex
  const domainRegex = /## (\d+)\. Domain: ([\w\s]+)/g;
  const domains = [];
  let match;
  
  while ((match = domainRegex.exec(domainsSection[0])) !== null) {
    domains.push({
      id: match[1],
      name: match[2].trim()
    });
  }
  
  return {
    type: 'domain_selection',
    content,
    options: domains
  };
}

/**
 * Parse framework selection response from stage 2
 * @param content - Text response from Claude
 * @returns Structured framework options
 */
function parseFrameworkResponse(content: string): PromptResponse {
  // Extract the "Brightest Bulbs" section
  const brightest = content.match(/# 6: Brightest Bulbs(.*?)(?=Which path should we explore further\?|$)/s);
  
  if (!brightest) {
    return { type: 'framework_selection', content, options: [] };
  }
  
  // Extract frameworks using regex
  const frameworkRegex = /(\d+)\. \*\*(.*?):\*\* (.*?)(?=\d+\. \*\*|$)/gs;
  const frameworks = [];
  let match;
  
  while ((match = frameworkRegex.exec(brightest[1])) !== null) {
    frameworks.push({
      id: match[1],
      title: match[2].trim(),
      description: match[3].trim()
    });
  }
  
  return {
    type: 'framework_selection',
    content,
    options: frameworks
  };
}

/**
 * Parse research questions response from stage 3
 * @param content - Text response from Claude
 * @returns Structured research questions
 */
function parseResearchResponse(content: string): PromptResponse {
  // Extract the research questions section
  const questionsSection = content.match(/<research_questions>(.*?)<\/research_questions>/s);
  
  if (!questionsSection) {
    return { type: 'research_questions', content, options: [] };
  }
  
  // Extract questions using regex
  const questionRegex = /(\d+)\. (.*?)(?=\d+\. |$)/gs;
  const questions = [];
  let match;
  
  while ((match = questionRegex.exec(questionsSection[1])) !== null) {
    questions.push({
      id: match[1],
      text: match[2].trim()
    });
  }
  
  // Extract top questions
  const topQuestionsSection = content.match(/Top Two Most Promising Research Questions:(.*?)$/s);
  let topQuestions = [];
  
  if (topQuestionsSection) {
    const topQuestionRegex = /(\d+)\. (.*?)(?=\d+\. |$)/gs;
    let topMatch;
    
    while ((topMatch = topQuestionRegex.exec(topQuestionsSection[1])) !== null) {
      topQuestions.push(topMatch[2].trim());
    }
  }
  
  return {
    type: 'research_questions',
    content,
    options: questions,
    topQuestions
  };
}

/**
 * Send research questions to an external API
 * @param questions - Array of research questions
 * @param apiProvider - 'perplexity' or 'elicit'
 * @param sessionId - Session identifier
 * @returns Response from research API
 */
export async function sendToResearchApi(
  questions: string[], 
  apiProvider: 'perplexity' | 'elicit', 
  sessionId: string
) {
  // Determine which API to use
  const apiConfig = getApiConfig(apiProvider);
  
  try {
    // Call the appropriate research API
    const response = await fetch(apiConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      },
      body: JSON.stringify({
        queries: questions,
        sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Research API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error sending to ${apiProvider} API:`, error);
    throw error;
  }
}

/**
 * Get configuration for specific research API
 * @param apiProvider - 'perplexity' or 'elicit'
 * @returns API configuration
 */
function getApiConfig(apiProvider: 'perplexity' | 'elicit') {
  const configs = {
    perplexity: {
      url: 'https://api.perplexity.ai/research',
      apiKey: process.env.PERPLEXITY_API_KEY || ''
    },
    elicit: {
      url: 'https://api.elicit.org/v1/search',
      apiKey: process.env.ELICIT_API_KEY || ''
    }
  };
  
  return configs[apiProvider];
}
