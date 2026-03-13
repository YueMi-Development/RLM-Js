import OpenAI from 'openai'
import type { LLMProvider, LLMCompletionFn, LLMMessage, LLMOptions, LLMResponse } from '../types'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI
  private defaultModel: string
  name = 'openai'

  constructor(apiKey: string, baseURL?: string, defaultModel: string = 'gpt-4o', headers?: Record<string, string>) {
    this.client = new OpenAI({ apiKey, baseURL, defaultHeaders: headers })
    this.defaultModel = defaultModel
  }

  completion: LLMCompletionFn = async (messages, options) => {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? null,
    })

    const result: LLMResponse = {
      content: response.choices[0].message.content || '',
    }

    if (response.usage) {
      result.usage = {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      }
    }

    return result
  }
}

/**
 * Functional factory for OpenAI
 */
export const createOpenAIProvider = (apiKey: string, baseURL?: string, defaultModel?: string, headers?: Record<string, string>): LLMCompletionFn => {
  const provider = new OpenAIProvider(apiKey, baseURL, defaultModel, headers)
  return provider.completion
}
