import { LLMService } from '../llm/LLMService'
import type { RLMQuestionNode, RLMConfig, DecompositionResult } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class RLMEngine {
  private llm: LLMService
  private config: RLMConfig

  constructor(llm: LLMService, config: RLMConfig) {
    this.llm = llm
    this.config = config
  }

  /**
   * Main entry point to solve a question
   */
  async solve(question: string): Promise<RLMQuestionNode> {
    const root: RLMQuestionNode = {
      id: uuidv4(),
      question,
      children: [],
      depth: 0,
      status: 'pending',
    }

    await this.processNode(root)
    return root
  }

  private async processNode(node: RLMQuestionNode): Promise<void> {
    if (node.depth >= this.config.maxDepth) {
      return this.solveDirectly(node)
    }

    node.status = 'decomposing'
    const decomposition = await this.checkAndDecompose(node.question)

    if (!decomposition.isComplex || !decomposition.subQuestions || decomposition.subQuestions.length === 0) {
      return this.solveDirectly(node)
    }

    // Create children nodes
    node.children = decomposition.subQuestions.slice(0, this.config.maxSubQuestions).map((q) => ({
      id: uuidv4(),
      question: q,
      children: [],
      depth: node.depth + 1,
      status: 'pending',
    }))

    // Solve sub-questions in parallel
    node.status = 'solving'
    await Promise.all(node.children.map((child) => this.processNode(child)))

    // Synthesize final answer
    node.status = 'synthesizing'
    node.answer = await this.synthesize(node.question, node.children)
    node.status = 'completed'
  }

  private async checkAndDecompose(question: string): Promise<DecompositionResult> {
    const prompt = `
You are a task decomposition assistant. 
Analyze the following question: "${question}"

Decide if it is complex and needs to be broken down into smaller, independent sub-questions.
If it is complex, provide a list of sub-questions.

Respond with valid JSON:
{
  "isComplex": boolean,
  "subQuestions": string[] | null
}
`
    const response = await this.llm.completion(
      [{ role: 'user', content: prompt }],
      { 
        providerId: this.config.decompositionProviderId || this.config.defaultProviderId,
        label: 'decomposition'
      }
    )

    try {
      // Find JSON block if it exists
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : response.content
      return JSON.parse(jsonStr) as DecompositionResult
    } catch (e) {
      return { isComplex: false }
    }
  }

  private async solveDirectly(node: RLMQuestionNode): Promise<void> {
    node.status = 'solving'
    const response = await this.llm.completion(
      [{ role: 'user', content: node.question }],
      { 
        providerId: this.config.defaultProviderId,
        label: 'solving'
      }
    )
    node.answer = response.content
    node.status = 'completed'
  }

  private async synthesize(question: string, children: RLMQuestionNode[]): Promise<string> {
    const subAnswers = children
      .map((c) => `Sub-question: ${c.question}\nAnswer: ${c.answer}`)
      .join('\n\n---\n\n')

    const prompt = `
Original Question: "${question}"

We have broken this down into sub-questions and solved them:
${subAnswers}

Based on the above information, provide a comprehensive and coherent answer to the original question.
`
    const response = await this.llm.completion(
      [{ role: 'user', content: prompt }],
      { 
        providerId: this.config.synthesisProviderId || this.config.defaultProviderId,
        label: 'synthesis'
      }
    )

    return response.content
  }
}
