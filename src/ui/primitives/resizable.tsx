import { ComponentProps } from "react"
import GripVerticalIcon from "lucide-react/dist/esm/icons/grip-vertical"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

type ResizablePrimitiveNamespace = typeof ResizablePrimitive
type ResizablePanelGroupPrimitive = ResizablePrimitiveNamespace extends {
  Group: infer T
}
  ? T
  : ResizablePrimitiveNamespace extends { PanelGroup: infer T }
    ? T
    : never
type ResizablePanelPrimitive = ResizablePrimitiveNamespace extends {
  Panel: infer T
}
  ? T
  : never
type ResizableHandlePrimitive = ResizablePrimitiveNamespace extends {
  Separator: infer T
}
  ? T
  : ResizablePrimitiveNamespace extends { PanelResizeHandle: infer T }
    ? T
    : never

const resizablePrimitives = ResizablePrimitive as ResizablePrimitiveNamespace & {
  Group?: ResizablePanelGroupPrimitive
  PanelGroup?: ResizablePanelGroupPrimitive
  Separator?: ResizableHandlePrimitive
  PanelResizeHandle?: ResizableHandlePrimitive
}

const ResizablePanelGroupPrimitive = (
  "Group" in resizablePrimitives
    ? resizablePrimitives.Group
    : resizablePrimitives.PanelGroup
) as ResizablePanelGroupPrimitive
const ResizablePanelPrimitive = resizablePrimitives.Panel as ResizablePanelPrimitive
const ResizableHandlePrimitive = (
  "Separator" in resizablePrimitives
    ? resizablePrimitives.Separator
    : resizablePrimitives.PanelResizeHandle
) as ResizableHandlePrimitive

function ResizablePanelGroup({
  className,
  ...props
}: ComponentProps<typeof ResizablePanelGroupPrimitive>) {
  return (
    <ResizablePanelGroupPrimitive
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col data-[group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: ComponentProps<typeof ResizablePanelPrimitive>) {
  return <ResizablePanelPrimitive data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ComponentProps<typeof ResizableHandlePrimitive> & {
  withHandle?: boolean
}) {
  return (
    <ResizableHandlePrimitive
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 data-[group-direction=vertical]:h-px data-[group-direction=vertical]:w-full data-[group-direction=vertical]:after:left-0 data-[group-direction=vertical]:after:h-1 data-[group-direction=vertical]:after:w-full data-[group-direction=vertical]:after:-translate-y-1/2 data-[group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90 [&[data-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizableHandlePrimitive>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
