import { Trash2 } from "lucide-react"
import { useState } from "react"

import type { DomainGroup, EnvironmentType } from "~types"

interface Props {
  group: DomainGroup
  currentHost?: string
  onSwitch: (group: DomainGroup, env: EnvironmentType, newTab: boolean) => void
  onDelete: (id: string) => void
}

export default function DomainGroup({
  group,
  currentHost,
  onSwitch,
  onDelete
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    onDelete(group.id)
    setShowConfirm(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900">{group.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{group.name}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 w-full">
        {group.envOrder.map((key) => {
          const domainExists = !!group.environments[key]
          return (
            <button
              key={key}
              onClick={(e) => onSwitch(group, key, e.metaKey || e.ctrlKey)}
              disabled={!domainExists}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors w-full
                ${
                  currentHost === group.environments[key].domain
                    ? "bg-blue-500 text-white"
                    : domainExists
                      ? "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}>
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
