/**
 * Upgrade to Full Mode Banner
 * 
 * Shows a banner for users in simple checkbox mode offering to upgrade to full 3-column mode.
 */

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, Info } from 'lucide-react'
import type { BoardMode } from '@/lib/types'

interface UpgradeToFullModeBannerProps {
  readonly boardMode: BoardMode
  readonly onUpgrade: () => void
}

export function UpgradeToFullModeBanner({ boardMode, onUpgrade }: UpgradeToFullModeBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  // Only show for simple mode
  if (boardMode !== 'simple' || dismissed) {
    return null
  }

  return (
    <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="flex items-center justify-between">
        <span className="text-blue-900 dark:text-blue-100">Simple Checklist Mode</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200">
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            You're using a simple checklist with just TODO and DONE columns. 
            Upgrade to get the full 3-column workflow with IN PROGRESS status and blocked indicators.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onUpgrade}
            >
              Upgrade to Full Mode
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
              onClick={() => setDismissed(true)}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
