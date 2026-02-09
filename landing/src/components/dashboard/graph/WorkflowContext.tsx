import { createContext, useContext } from 'react'

interface WorkflowContextValue {
  onInfoClick?: (brainItemId: string) => void
}

export const WorkflowContext = createContext<WorkflowContextValue>({})

export function useWorkflowContext() {
  return useContext(WorkflowContext)
}
