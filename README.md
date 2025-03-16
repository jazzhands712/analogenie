# ANALOGENIE

A sophisticated cognitive analysis service that generates novel insights, metaphors, and research questions by connecting user concepts with various domains using Claude 3.7 Sonnet API.

## Features

- **Three-Stage Sequential Prompt Workflow**:
  - Stage 1: Domain Selection - User inputs a concept, system returns top 5 domain options
  - Stage 2: Conceptual Framework Generation - System generates metaphorical frameworks
  - Stage 3: Hypothesis & Research Question Generation - System generates hypotheses and research questions
- **Continuous Scroll Chatbot Interface**: Similar to Claude
- **Dark Mode UI**: Indigo-themed dark mode interface
- **Responsive Design**: Compatible with desktop and mobile devices
- **API Integration**: Claude 3.7 Sonnet via Anthropic API
- **Error Handling**: Input validation and API error handling
- **Loading State Management**: Visual indicators during API calls

## Getting Started

### Prerequisites

- Node.js 18 or later
- PNPM package manager
- Anthropic API key (Claude 3.7 Sonnet)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jazzhands712/analogenie.git
   cd analogenie
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a concept (maximum 12 words) in the input field
2. The system will analyze your concept and suggest 5 domains
3. Select a domain to generate metaphorical frameworks
4. Select a framework to generate hypotheses and research questions
5. Optionally, send research questions to external research APIs

## Deployment

See the [Deployment Guide](docs/deployment-guide.md) for detailed instructions on deploying the application to Vercel.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Anthropic for providing the Claude 3.7 Sonnet API
- Next.js and Vercel for the development framework and hosting platform
- Tailwind CSS for the styling framework
