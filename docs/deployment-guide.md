# ANALOGENIE Deployment Guide

This guide provides instructions for deploying the ANALOGENIE web application to Vercel.

## Prerequisites

Before deploying, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. The ANALOGENIE project files
3. API keys for Anthropic (Claude 3.7 Sonnet)
4. Optional: API keys for Perplexity and Elicit research APIs

## Deployment Options

### Option 1: Deploy from Git Repository (Recommended)

1. Push your ANALOGENIE project to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account
3. Click "Add New" > "Project"
4. Select your repository from the list
5. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: pnpm build
   - Output Directory: .next
6. Add environment variables:
   - ANTHROPIC_API_KEY: Your Anthropic API key
   - SYSTEM_PROMPT_1: The system prompt for stage 1
   - SYSTEM_PROMPT_2: The system prompt for stage 2
   - SYSTEM_PROMPT_3: The system prompt for stage 3
   - Optional: PERPLEXITY_API_KEY and ELICIT_API_KEY
7. Click "Deploy"

### Option 2: Deploy from Local Directory (Without Git Sync)

1. Install Vercel CLI:
   ```bash
   pnpm install -g vercel
   ```

2. Navigate to your ANALOGENIE project directory:
   ```bash
   cd path/to/analogenie
   ```

3. Create a `.env.local` file with your environment variables:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   SYSTEM_PROMPT_1=your_prompt_here
   SYSTEM_PROMPT_2=your_prompt_here
   SYSTEM_PROMPT_3=your_prompt_here
   ```

4. Deploy to Vercel:
   ```bash
   vercel
   ```

5. Follow the CLI prompts:
   - Log in to Vercel if prompted
   - Set up and deploy project
   - Choose "No" when asked to link to existing project
   - Specify project name
   - Specify directory (usually the current directory)

6. For production deployment:
   ```bash
   vercel --prod
   ```

### Option 3: Preview Deployment (Without Production)

For testing purposes, you can create a preview deployment:

1. Install Vercel CLI as in Option 2
2. Run:
   ```bash
   vercel
   ```
3. Follow the prompts but don't deploy to production
4. This will give you a preview URL to test your application

## Environment Variables

Ensure these environment variables are set in your Vercel project:

| Variable | Description | Required |
|----------|-------------|----------|
| ANTHROPIC_API_KEY | API key for Claude 3.7 Sonnet | Yes |
| SYSTEM_PROMPT_1 | System prompt for Domain Selection | Yes |
| SYSTEM_PROMPT_2 | System prompt for Framework Generation | Yes |
| SYSTEM_PROMPT_3 | System prompt for Hypothesis Generation | Yes |
| PERPLEXITY_API_KEY | API key for Perplexity research | No |
| ELICIT_API_KEY | API key for Elicit research | No |

## Post-Deployment

After deployment:

1. Visit your deployed application URL
2. Test the application by submitting a concept
3. Verify that all three stages work correctly
4. Check that error handling works as expected

## Troubleshooting

If you encounter issues:

1. Check Vercel deployment logs for errors
2. Verify environment variables are set correctly
3. Ensure API keys are valid
4. Check browser console for client-side errors

## Updating Your Deployment

To update your deployment:

1. Make changes to your code
2. If using Git, push changes to your repository and Vercel will automatically redeploy
3. If using CLI, run `vercel --prod` again to deploy the latest changes

## Custom Domains

To use a custom domain:

1. Go to your project in the Vercel dashboard
2. Click "Domains"
3. Add your domain and follow the instructions to configure DNS
