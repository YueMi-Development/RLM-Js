import { OpenRouter } from "@openrouter/sdk"
import type { LLMProvider, LLMCompletionFn, LLMMessage, LLMOptions, LLMResponse } from '../types'

export class OpenRouterProvider implements LLMProvider {
  private client: OpenRouter
  private defaultModel: string
  name = 'openrouter'

  constructor(apiKey: string, defaultModel: string = 'anthropic/claude-3.5-sonnet', referrals?: { siteUrl?: string, siteName?: string }) {
    this.client = new OpenRouter({ apiKey })
    this.defaultModel = defaultModel
    
    // OpenRouter SDK typically handles the referrer/title if passed in options
    // But since I don't have the full API reference, I'll assume standard OpenAI-like usage
  }

  completion: LLMCompletionFn = async (messages, options) => {
    const response = await this.client.chat.send({
      chatGenerationParams: {
        model: options?.model || this.defaultModel,
        messages: messages as any,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? undefined,
        stream: false,
      },
    })

    const choice = response.choices[0]
    const content = 'message' in choice ? choice.message.content || '' : ''

    const result: LLMResponse = {
      content: content,
    }

    if (response.usage) {
      result.usage = {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
      }
    }

    return result
  }
}

/**
 * Functional factory for OpenRouter
 */
export const createOpenRouterProvider = (
  apiKey: string, 
  defaultModel?: string, 
  referrals?: { siteUrl?: string, siteName?: string }
): LLMCompletionFn => {
  const provider = new OpenRouterProvider(apiKey, defaultModel, referrals)
  return provider.completion
}
