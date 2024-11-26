import { useState } from "react"

import type { DomainGroup, EnvironmentType } from "~types"

interface Props {
  currentUrl: URL | null
  onAdd: (group: DomainGroup) => void
  onCancel: () => void
}

export default function QuickAddForm({ currentUrl, onAdd, onCancel }: Props) {
  const [name, setName] = useState("")
  const [environment, setEnvironment] = useState<EnvironmentType>("dev")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Group name cannot be empty")
      return
    }
    if (trimmedName.length < 2) {
      setError("Group name must be at least 2 characters")
      return
    }
    if (trimmedName.length > 50) {
      setError("Group name must be less than 50 characters")
      return
    }

    console.log(currentUrl)

    // If current URL is required but not available
    if (!currentUrl?.host) {
      setError("Current URL is invalid!")
      return
    }

    const newGroup: DomainGroup = {
      id: Date.now().toString(),
      name: trimmedName,
      environments: {
        local:
          environment === "local"
            ? { domain: currentUrl.host, protocol: currentUrl.protocol + "//" }
            : null,
        dev:
          environment === "dev"
            ? { domain: currentUrl.host, protocol: currentUrl.protocol + "//" }
            : null,
        prod:
          environment === "prod"
            ? { domain: currentUrl.host, protocol: currentUrl.protocol + "//" }
            : null
      },
      envOrder: ["local", "dev", "prod"]
    }

    onAdd(newGroup)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-medium mb-4">Quick Add Domain</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter group name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Environment
          </label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="local">Local</option>
            <option value="dev">Development</option>
            <option value="prod">Production</option>
          </select>
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Add Domain
          </button>
        </div>
      </div>
    </form>
  )
}
