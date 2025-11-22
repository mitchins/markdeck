import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FileUploader } from '@/components/FileUploader'

describe('FileUploader', () => {
  it('loads and decodes STATUS.md content from a GitHub URL', async () => {
    const user = userEvent.setup()
    const onFileLoad = vi.fn()

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: 'SGVsbG8=\n' }),
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<FileUploader onFileLoad={onFileLoad} />)

    await user.type(
      screen.getByPlaceholderText('https://github.com/owner/repo'),
      'https://github.com/example/repo'
    )

    await user.click(screen.getByRole('button', { name: /^Load$/i }))

    await waitFor(() => {
      expect(onFileLoad).toHaveBeenCalledWith('Hello')
    })

    vi.unstubAllGlobals()
  })
})
