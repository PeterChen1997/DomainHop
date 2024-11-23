import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import type { DomainGroup } from "~types"

interface Props {
  group: DomainGroup
  onSave: (group: DomainGroup) => void
  onDelete: (id: string) => void
}

export default function DomainGroupForm({ group, onSave, onDelete }: Props) {
  const [formData, setFormData] = useState(group)

  const handleChange = (
    field: string,
    value: string | { [key: string]: string }
  ) => {
    const newData = {
      ...formData,
      [field]: value
    }
    setFormData(newData)
    onSave(newData)
  }

  return (
    <div className="relative p-6">
      <button
        onClick={() => onDelete(group.id)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
        title="Delete group">
        <Trash2 size={18} />
      </button>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="text-xl font-semibold bg-transparent border-none focus:ring-0 w-full"
            placeholder="Group Name"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(formData.environments).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  handleChange("environments", {
                    ...formData.environments,
                    [key]: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${key} domain`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
