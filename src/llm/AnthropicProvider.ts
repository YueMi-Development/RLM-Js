import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, LLMCompletionFn, LLMMessage, LLMOptions, LLMResponse } from '../types'

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic
  private defaultModel: string
  name = 'anthropic'

  constructor(apiKey: string, defaultModel: string = 'claude-3-5-sonnet-latest') {
    this.client = new Anthropic({ apiKey })
    this.defaultModel = defaultModel
  }

  completion: LLMCompletionFn = async (messages, options) => {
    // Anthropic doesn't have a 'system' role in messages list, it's a separate parameter
    const systemMessage = messages.find((m) => m.role === 'system')?.content
    const userMessages = messages.filter((m) => m.role !== 'system')

    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 1024,
      system: systemMessage,
      messages: userMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.7,
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''

    return {
      content,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    }
  }
}

/**
 * Functional factory for Anthropic
 */
export const createAnthropicProvider = (apiKey: string, defaultModel?: string): LLMCompletionFn => {
  const provider = new AnthropicProvider(apiKey, defaultModel)
  return provider.completion
}
