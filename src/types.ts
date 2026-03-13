export type LLMMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type LLMResponse = {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export type LLMOptions = {
  model?: string
  temperature?: number
  maxTokens?: number
  [key: string]: any
}

export type LLMCompletionFn = (messages: LLMMessage[], options?: LLMOptions) => Promise<LLMResponse>

export interface LLMProvider {
  name: string
  completion: LLMCompletionFn
}

export type RLMEngineStatus = 'pending' | 'decomposing' | 'solving' | 'synthesizing' | 'completed' | 'failed'

export type RLMQuestionNode = {
  id: string
  question: string
  answer?: string
  children: RLMQuestionNode[]
  depth: number
  status: RLMEngineStatus
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export type RLMConfig = {
  maxDepth: number
  maxSubQuestions: number
  defaultProviderId?: string
  decompositionProviderId?: string
  synthesisProviderId?: string
  maxTokens?: number
  strategy?: 'fixed' | 'round-robin'
  providerPool?: string[]
  maxRetries?: number
}

export type DecompositionResult = {
  isComplex: boolean
  subQuestions?: string[]
}
