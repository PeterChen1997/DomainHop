import { Plus, Trash2 } from "lucide-react"
import { useCallback, useState } from "react"

import type { DomainGroup, Protocol } from "~types"
import { PROTOCOLS } from "~types"

interface Props {
  group: DomainGroup
  onSave: (group: DomainGroup) => void
  onDelete: (id: string) => void
}

export default function DomainGroupForm({ group, onSave, onDelete }: Props) {
  const [formData, setFormData] = useState(group)
  const [newEnvName, setNewEnvName] = useState("")
  const [showAddEnv, setShowAddEnv] = useState(false)
  const [editingEnvName, setEditingEnvName] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = useCallback(
    (
      field: string,
      value: string | { [key: string]: { domain: string; protocol: string } }
    ) => {
      const newData = { ...formData, [field]: value }
      setFormData(newData)
      onSave(newData)
    },
    [formData, onSave]
  )

  const addNewEnvironment = () => {
    const envName = newEnvName.toLowerCase().trim()
    if (!envName) {
      setErrorMessage("Please enter an environment name")
      return
    }
    if (formData.envOrder.includes(envName)) {
      setErrorMessage("This environment name already exists")
      return
    }

    setErrorMessage(null)
    const newEnvOrder = [...formData.envOrder, envName]
    const newEnvironments = {
      ...formData.environments,
      [envName]: {
        domain: "",
        protocol: "https://"
      }
    }

    const newData = {
      ...formData,
      environments: newEnvironments,
      envOrder: newEnvOrder
    }
    setFormData(newData)
    onSave(newData)
    setNewEnvName("")
    setShowAddEnv(false)
  }

  const removeEnvironment = (env: string) => {
    const newEnvOrder = formData.envOrder.filter((e) => e !== env)
    const newEnvironments = { ...formData.environments }
    delete newEnvironments[env]

    const newData = {
      ...formData,
      environments: newEnvironments,
      envOrder: newEnvOrder
    }
    setFormData(newData)
    onSave(newData)
  }

  const updateEnvironmentName = (oldName: string, newName: string) => {
    const trimmedNewName = newName.toLowerCase().trim()
    if (
      !trimmedNewName ||
      oldName === trimmedNewName ||
      formData.envOrder.includes(trimmedNewName)
    ) {
      setEditingEnvName(null)
      return
    }

    const newEnvOrder = formData.envOrder.map((name) =>
      name === oldName ? trimmedNewName : name
    )
    const newEnvironments = { ...formData.environments }
    newEnvironments[trimmedNewName] = newEnvironments[oldName]
    delete newEnvironments[oldName]

    const newData = {
      ...formData,
      environments: newEnvironments,
      envOrder: newEnvOrder
    }

    console.log(newData, "new")

    setFormData(newData)
    onSave(newData)
    setEditingEnvName(null)
  }

  return (
    <div className="relative p-6">
      <button
        onClick={() => onDelete(group.id)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
        title="Delete group">
        <Trash2 size={18} />
      </button>

      <div className="space-y-6">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="text-xl font-semibold bg-transparent border-none focus:ring-0 w-full"
          placeholder="Group Name"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.envOrder.map((key) => (
            <div key={key} className="group relative">
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {formData.envOrder.length > 1 && (
                  <button
                    onClick={() => removeEnvironment(key)}
                    className="p-1 bg-red-50 rounded-full text-red-500 hover:bg-red-100">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                {editingEnvName === key ? (
                  <input
                    type="text"
                    defaultValue={key}
                    autoFocus
                    onBlur={(e) => updateEnvironmentName(key, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateEnvironmentName(key, e.currentTarget.value)
                      } else if (e.key === "Escape") {
                        setEditingEnvName(null)
                      }
                    }}
                    className="block w-full text-sm font-medium text-gray-700 mb-2 bg-white border border-gray-300 rounded px-2 py-1"
                  />
                ) : (
                  <label
                    className="block text-sm font-medium text-gray-700 capitalize mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => setEditingEnvName(key)}
                    title="Click to edit">
                    {key}
                  </label>
                )}
                <div className="flex gap-2">
                  <select
                    value={formData.environments[key]?.protocol || "https://"}
                    onChange={(e) => {
                      const protocol = e.target.value as Protocol
                      handleChange("environments", {
                        ...formData.environments,
                        [key]: {
                          ...formData.environments[key],
                          protocol
                        }
                      })
                    }}
                    className="w-24 px-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    {PROTOCOLS.map((protocol) => (
                      <option key={protocol} value={protocol}>
                        {protocol}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.environments[key]?.domain || ""}
                    onChange={(e) => {
                      handleChange("environments", {
                        ...formData.environments,
                        [key]: {
                          ...formData.environments[key],
                          domain: e.target.value
                        }
                      })
                    }}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${key} domain`}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowAddEnv(true)}
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-gray-500 hover:text-blue-500">
            <Plus size={18} />
            Add Environment
          </button>
        </div>

        {showAddEnv && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-medium mb-4">Add New Environment</h3>
              <input
                type="text"
                value={newEnvName}
                onChange={(e) => {
                  setNewEnvName(e.target.value)
                  setErrorMessage(null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                placeholder="Environment name (e.g. staging)"
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddEnv(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  Cancel
                </button>
                <button
                  onClick={addNewEnvironment}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
