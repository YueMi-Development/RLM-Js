import type { 
  LLMProvider, 
  LLMCompletionFn, 
  LLMMessage, 
  LLMOptions, 
  LLMResponse 
} from '../types'

export class LLMService {
  private providers: Map<string, LLMCompletionFn> = new Map()
  private defaultProviderId?: string

  /**
   * Register a provider (either a class instance or a function)
   */
  register(id: string, provider: LLMProvider | LLMCompletionFn, isDefault = false) {
    if (typeof provider === 'function') {
      this.providers.set(id, provider)
    } else {
      this.providers.set(id, provider.completion.bind(provider))
    }

    if (isDefault || !this.defaultProviderId) {
      this.defaultProviderId = id
    }
  }

  /**
   * Run completion using a specific or default provider
   */
  async completion(
    messages: LLMMessage[],
    options?: LLMOptions & { providerId?: string }
  ): Promise<LLMResponse> {
    const id = options?.providerId || this.defaultProviderId
    if (!id) {
      throw new Error('No LLM providers registered')
    }

    const completionFn = this.providers.get(id)
    if (!completionFn) {
      throw new Error(`Provider with ID "${id}" not found`)
    }

    return completionFn(messages, options)
  }

  getRegisteredProviderIds(): string[] {
    return Array.from(this.providers.keys())
  }
}
