import { debounce } from "lodash-es"
import { Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import DomainGroupForm from "~components/DomainGroupForm"
import { getDomainGroups, setDomainGroups } from "~storage/domain-groups"
import type { DomainGroup } from "~types"

import "./styles.css"

const Toast = ({
  message,
  type = "success"
}: {
  message: string
  type?: "success" | "error"
}) => (
  <div
    className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-lg animate-fade-in ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`}>
    {message}
  </div>
)

export default function Options() {
  const [groups, setGroups] = useState<DomainGroup[]>([])
  const [saveIndicator, setSaveIndicator] = useState(false)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)

  useEffect(() => {
    loadGroups()
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave(groups)
      }
    }
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  const debouncedSave = useCallback(
    debounce((updatedGroups: DomainGroup[]) => {
      handleSave(updatedGroups)
    }, 1000),
    []
  )

  const loadGroups = async () => {
    const loadedGroups = await getDomainGroups()
    setGroups(loadedGroups)
  }

  const handleSave = async (updatedGroups: DomainGroup[]) => {
    await setDomainGroups(updatedGroups)
    setGroups(updatedGroups)
    setSaveIndicator(true)
    setTimeout(() => setSaveIndicator(false), 2000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return

    const updatedGroups = groups.filter((g) => g.id !== id)
    setGroups(updatedGroups)
    await setDomainGroups(updatedGroups)
    setSaveIndicator(true)
    setTimeout(() => setSaveIndicator(false), 2000)
  }

  const addNewGroup = async () => {
    const hasEmptyForm = groups.some(
      (g) => !g.name || Object.values(g.environments).every((v) => !v)
    )

    if (hasEmptyForm) {
      setShowEmptyWarning(true)
      setTimeout(() => setShowEmptyWarning(false), 3000)
      return
    }

    const newGroup: DomainGroup = {
      id: Date.now().toString(),
      name: "New Group",
      environments: {
        local: { domain: "", protocol: "http://" },
        dev: { domain: "", protocol: "https://" },
        prod: { domain: "", protocol: "https://" }
      },
      envOrder: ["local", "dev", "prod"]
    }
    const updatedGroups = [...groups, newGroup]
    setGroups(updatedGroups)
    await setDomainGroups(updatedGroups)
    setSaveIndicator(true)
    setTimeout(() => setSaveIndicator(false), 2000)
  }

  const handleGroupUpdate = (updatedGroup: DomainGroup) => {
    debouncedSave(
      groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g))
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1186px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Domain Switcher
            </h1>
            <p className="text-gray-500 mt-2">
              Manage your domain groups and environments
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={addNewGroup}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
              <Plus size={18} />
              Add New Group
            </button>
            {showEmptyWarning && (
              <Toast
                message="Please fill in the empty group first"
                type="error"
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <DomainGroupForm
                group={group}
                onSave={handleGroupUpdate}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>

        {saveIndicator && <Toast message="Changes saved" type="success" />}
      </div>
    </div>
  )
}
