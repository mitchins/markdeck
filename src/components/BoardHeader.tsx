/**
 * BoardHeader component - renders the single header row for all columns
 * Shared between BoardView and Board components
 */

import type { StatusColumn } from '@/lib/types'
import { getColumnIcon, getColumnColor } from '@/lib/column-config'

interface BoardHeaderProps {
  columnsToShow: StatusColumn[]
  gridColsClass: string
}

export function BoardHeader({ columnsToShow, gridColsClass }: BoardHeaderProps) {
  return (
    <div className={`grid ${gridColsClass} gap-4 p-4 bg-muted/30 border-b border-border sticky top-0 z-10`}>
      <div className="font-semibold text-sm">Swimlane</div>
      {columnsToShow.map((statusCol) => {
        const Icon = getColumnIcon(statusCol.key)
        const color = getColumnColor(statusCol.key)
        return (
          <div key={statusCol.key} className="flex items-center gap-2">
            <Icon className={color} size={16} />
            <h3 className="text-xs font-medium tracking-wider">{statusCol.label}</h3>
          </div>
        )
      })}
    </div>
  )
}
