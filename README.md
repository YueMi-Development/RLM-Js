# RLM-NodeJs (@yuemi-development/rlm-js)

Recursive LLM (RLM) is a library designed to solve complex problems by breaking them down into simpler sub-questions, solving each independently, and synthesizing the results back into a coherent final answer.

This approach is highly effective for "small" LLMs that might struggle with large contexts or multifaceted reasoning tasks.

## Features

- **Recursive Decomposition**: Automatically breaks complex prompts into manageable sub-tasks.
- **Parallel Solving**: Solves sub-questions in parallel to optimize speed.
- **Provider Agnostic**: Support for OpenAI, Anthropic, DeepSeek, OpenRouter, and custom providers.
- **Load Balancing**: Round-robin distribution across multiple LLM endpoints.
- **Token Budgeting**: Global token limit enforcement to prevent runaway costs.
- **Progress Tracking**: Real-time labels for decomposition, solving, and synthesis phases.

## Installation

```bash
npm install @yuemi-development/rlm-js
```

## Quick Start

```javascript
const { LLMService, RLMEngine, createOpenAIProvider } = require('@yuemi-development/rlm-js')

// 1. Setup LLM Service
const llm = new LLMService()
llm.register('openai', createOpenAIProvider('your-api-key'))

// 2. Initialize Engine
const engine = new RLMEngine(llm, {
  maxDepth: 3,
  maxSubQuestions: 3,
  maxTokens: 50000,
  strategy: 'round-robin'
})

// 3. Solve!
const result = await engine.solve('Explain the nuances of quantum entanglement.')
console.log(result.answer)
```

## Configuration

The `RLMEngine` accepts an options object:

- `maxDepth`: Max levels of recursion.
- `maxSubQuestions`: Max sub-questions generated per step.
- `maxTokens`: Global token limit for the entire process.
- `strategy`: `'fixed'` (default) or `'round-robin'`.
- `providerPool`: Optional array of provider IDs for load balancing.
