# Deployed Application Codebase

This is a complete, independently reproducible copy of the web application that is currently deployed on Vercel. 

Originally developed and deployed by Snehal Dixit.

*Note: This folder is provided for handover purposes so that future members can fork/copy this codebase and create their own independent deployments. The original repository, authorship, and the live Vercel deployment remain under the ownership of Snehal Dixit.*

## Tech Stack
- **Framework**: React with Vite
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS v4
- **State/Data**: TanStack Query
- **AI/LLM**: Web-LLM, AI SDK, TensorFlow.js
- **UI Components**: Radix UI, Framer Motion

## Setup Instructions

### 1. Install Dependencies
Make sure you have Node.js installed, then install the dependencies using npm:
```bash
npm install
```

### 2. Environment Variables
Copy the provided `.env.example` file to create your own `.env` file:
```bash
cp .env.example .env
```
Populate the following variables in your `.env` file with your own credentials (e.g. OpenAI API keys and backend URLs):
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `VITE_API_URL`
- `NODE_ENV`

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Build for Production
To build the application for deployment:
```bash
npm run build
```
The compiled static assets will be output to the `dist/` directory.

## Deployment Instructions

This application is ready to be deployed to **Vercel** or any static hosting provider.
A `vercel.json` configuration file is already included.

If you are creating your own independent deployment:
1. Fork or copy this `deployed-application` folder to your own repository.
2. Connect your repository to your own Vercel account.
3. Configure the **Build Command** as `npm run build`.
4. Configure the **Output Directory** as `dist`.
5. Ensure you add the required environment variables listed above to your Vercel project settings under Settings > Environment Variables.
