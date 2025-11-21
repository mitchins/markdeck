/**
 * MCP Server for MarkDeck
 * 
 * A minimal, focused MCP server that provides safe, structured operations
 * for manipulating STATUS.md files while maintaining round-trip fidelity.
 * 
 * Reuses existing parser and serializer - no new state models introduced.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
import { projectToMarkdown } from '@/core/parsers/markdown-serializer'
import type { Card, CardStatus, Project } from '@/core/domain/types'
import { IdGenerator } from '@/core/utils/id-generator'

/**
 * Read and parse a STATUS.md file
 */
async function readStatusFile(statusPath: string): Promise<Project> {
  const absolutePath = resolve(statusPath)
  const content = await readFile(absolutePath, 'utf-8')
  return parseStatusMarkdown(content)
}

/**
 * Write a project back to STATUS.md
 */
async function writeStatusFile(statusPath: string, project: Project): Promise<void> {
  const absolutePath = resolve(statusPath)
  const markdown = projectToMarkdown(project)
  await writeFile(absolutePath, markdown, 'utf-8')
}

/**
 * Get board state from STATUS.md
 */
async function getBoard(statusPath: string) {
  const project = await readStatusFile(statusPath)
  
  return {
    metadata: project.metadata,
    swimlanes: project.swimlanes,
    cards: project.cards.map(card => ({
      id: card.id,
      laneId: card.laneId,
      status: card.status,
      blocked: card.blocked,
      title: card.title,
      description: card.description,
      links: card.links,
      originalLine: card.originalLine,
    })),
    notes: project.notes,
  }
}

/**
 * Update an existing card
 */
async function updateCard(
  statusPath: string,
  cardId: string,
  changes: {
    laneId?: string
    status?: CardStatus
    blocked?: boolean
    title?: string
    description?: string
  }
): Promise<Project> {
  const project = await readStatusFile(statusPath)
  
  const card = project.cards.find(c => c.id === cardId)
  if (!card) {
    throw new Error(`Card with id ${cardId} not found`)
  }
  
  // Apply changes
  if (changes.laneId !== undefined) card.laneId = changes.laneId
  if (changes.status !== undefined) card.status = changes.status
  if (changes.blocked !== undefined) card.blocked = changes.blocked
  if (changes.title !== undefined) card.title = changes.title
  if (changes.description !== undefined) card.description = changes.description
  
  // Normalize: DONE cards cannot be blocked
  if (card.status === 'done') {
    card.blocked = false
  }
  
  await writeStatusFile(statusPath, project)
  return project
}

/**
 * Add a new card to the board
 */
async function addCard(
  statusPath: string,
  laneId: string,
  status: CardStatus,
  blocked: boolean,
  title: string,
  description?: string
): Promise<Project> {
  const project = await readStatusFile(statusPath)
  const idGenerator = new IdGenerator()
  
  // Find the last card in the target lane to determine insertion point
  const laneCards = project.cards.filter(c => c.laneId === laneId)
  const lastLineInLane = laneCards.length > 0
    ? Math.max(...laneCards.map(c => c.originalLine))
    : project.cards.length > 0
      ? Math.max(...project.cards.map(c => c.originalLine))
      : 0
  
  const newCard: Card = {
    id: idGenerator.generateCardId(laneId, title),
    laneId,
    status: status === 'done' ? 'done' : status, // Normalize
    blocked: status === 'done' ? false : blocked, // DONE cannot be blocked
    title,
    description: description || '',
    links: [],
    originalLine: lastLineInLane + 1,
  }
  
  project.cards.push(newCard)
  
  await writeStatusFile(statusPath, project)
  return project
}

/**
 * Delete a card from the board
 */
async function deleteCard(statusPath: string, cardId: string): Promise<Project> {
  const project = await readStatusFile(statusPath)
  
  const cardIndex = project.cards.findIndex(c => c.id === cardId)
  if (cardIndex === -1) {
    throw new Error(`Card with id ${cardId} not found`)
  }
  
  project.cards.splice(cardIndex, 1)
  
  await writeStatusFile(statusPath, project)
  return project
}

/**
 * Move a card to a different lane (helper)
 */
async function moveCard(
  statusPath: string,
  cardId: string,
  targetLaneId: string
): Promise<Project> {
  return updateCard(statusPath, cardId, { laneId: targetLaneId })
}

/**
 * Create and start the MCP server
 */
async function main() {
  const server = new Server(
    {
      name: 'markdeck-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_board',
          description: 'Parse STATUS.md and return the board state with lanes and cards',
          inputSchema: {
            type: 'object',
            properties: {
              statusPath: {
                type: 'string',
                description: 'Path to the STATUS.md file',
              },
            },
            required: ['statusPath'],
          },
        },
        {
          name: 'update_card',
          description: 'Update properties of an existing card (status, blocked, title, description, lane)',
          inputSchema: {
            type: 'object',
            properties: {
              statusPath: {
                type: 'string',
                description: 'Path to the STATUS.md file',
              },
              cardId: {
                type: 'string',
                description: 'ID of the card to update',
              },
              changes: {
                type: 'object',
                description: 'Changes to apply to the card',
                properties: {
                  laneId: {
                    type: 'string',
                    description: 'New lane ID',
                  },
                  status: {
                    type: 'string',
                    enum: ['todo', 'in_progress', 'done'],
                    description: 'New status',
                  },
                  blocked: {
                    type: 'boolean',
                    description: 'Whether the card is blocked',
                  },
                  title: {
                    type: 'string',
                    description: 'New title',
                  },
                  description: {
                    type: 'string',
                    description: 'New description',
                  },
                },
              },
            },
            required: ['statusPath', 'cardId', 'changes'],
          },
        },
        {
          name: 'add_card',
          description: 'Add a new card to the board',
          inputSchema: {
            type: 'object',
            properties: {
              statusPath: {
                type: 'string',
                description: 'Path to the STATUS.md file',
              },
              laneId: {
                type: 'string',
                description: 'Lane ID where the card should be added',
              },
              status: {
                type: 'string',
                enum: ['todo', 'in_progress', 'done'],
                description: 'Status of the new card',
              },
              blocked: {
                type: 'boolean',
                description: 'Whether the card is blocked (ignored for done status)',
              },
              title: {
                type: 'string',
                description: 'Title of the new card',
              },
              description: {
                type: 'string',
                description: 'Optional description for the card',
              },
            },
            required: ['statusPath', 'laneId', 'status', 'blocked', 'title'],
          },
        },
        {
          name: 'delete_card',
          description: 'Delete a card from the board',
          inputSchema: {
            type: 'object',
            properties: {
              statusPath: {
                type: 'string',
                description: 'Path to the STATUS.md file',
              },
              cardId: {
                type: 'string',
                description: 'ID of the card to delete',
              },
            },
            required: ['statusPath', 'cardId'],
          },
        },
        {
          name: 'move_card',
          description: 'Move a card to a different lane',
          inputSchema: {
            type: 'object',
            properties: {
              statusPath: {
                type: 'string',
                description: 'Path to the STATUS.md file',
              },
              cardId: {
                type: 'string',
                description: 'ID of the card to move',
              },
              targetLaneId: {
                type: 'string',
                description: 'ID of the target lane',
              },
            },
            required: ['statusPath', 'cardId', 'targetLaneId'],
          },
        },
      ],
    }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    if (!args) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: 'No arguments provided' }, null, 2),
          },
        ],
        isError: true,
      }
    }

    try {
      switch (name) {
        case 'get_board': {
          const board = await getBoard(args.statusPath as string)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(board, null, 2),
              },
            ],
          }
        }

        case 'update_card': {
          const project = await updateCard(
            args.statusPath as string,
            args.cardId as string,
            args.changes as {
              laneId?: string
              status?: CardStatus
              blocked?: boolean
              title?: string
              description?: string
            }
          )
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    card: project.cards.find(c => c.id === args.cardId),
                  },
                  null,
                  2
                ),
              },
            ],
          }
        }

        case 'add_card': {
          const project = await addCard(
            args.statusPath as string,
            args.laneId as string,
            args.status as CardStatus,
            args.blocked as boolean,
            args.title as string,
            args.description as string | undefined
          )
          const newCard = project.cards[project.cards.length - 1]
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    card: newCard,
                  },
                  null,
                  2
                ),
              },
            ],
          }
        }

        case 'delete_card': {
          await deleteCard(args.statusPath as string, args.cardId as string)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ success: true }, null, 2),
              },
            ],
          }
        }

        case 'move_card': {
          const project = await moveCard(
            args.statusPath as string,
            args.cardId as string,
            args.targetLaneId as string
          )
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    card: project.cards.find(c => c.id === args.cardId),
                  },
                  null,
                  2
                ),
              },
            ],
          }
        }

        default:
          throw new Error(`Unknown tool: ${name}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
        isError: true,
      }
    }
  })

  // Start the server
  const transport = new StdioServerTransport()
  await server.connect(transport)
  
  console.error('MarkDeck MCP Server running on stdio')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
