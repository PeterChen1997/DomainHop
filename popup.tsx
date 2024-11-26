import { Plus, Settings, SwitchCamera } from "lucide-react"
import { useEffect, useState } from "react"

import DomainGroupComponent from "~components/DomainGroup"
import NoMatch from "~components/NoMatch"
import QuickAddForm from "~components/QuickAddForm"
import {
  addDomainGroup,
  deleteDomainGroup,
  getDomainGroups
} from "~storage/domain-groups"
import type { DomainGroup } from "~types"

import "./styles.css"

export default function IndexPopup() {
  const [domainGroups, setDomainGroups] = useState<DomainGroup[]>([])
  const [currentUrl, setCurrentUrl] = useState<URL | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [hasMatch, setHasMatch] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    const currentUrl: URL | null = tab.url ? new URL(tab.url) : null
    setCurrentUrl(currentUrl)

    const groups = (await getDomainGroups()).filter((group) =>
      Object.values(group.environments).some(
        (env?: { domain: string; protocol: string }) =>
          env?.domain?.toLowerCase() === currentUrl?.host.toLowerCase()
      )
    )

    console.log(groups)

    setDomainGroups(groups)
    setHasMatch(groups.length > 0)
  }

  const handleSwitch = async (
    group: DomainGroup,
    targetEnv: string,
    newTab: boolean
  ) => {
    if (!currentUrl) return

    const targetEnvironment = group.environments[targetEnv]
    if (!targetEnvironment?.domain) return

    const newUrl = new URL(currentUrl.toString())
    newUrl.protocol = targetEnvironment.protocol.replace("://", "")

    if (targetEnvironment.domain.includes(":")) {
      newUrl.host = targetEnvironment.domain
    } else {
      newUrl.hostname = targetEnvironment.domain
      newUrl.port = ""
    }

    if (newTab) {
      chrome.tabs.create({ url: newUrl.toString() })
    } else {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      chrome.tabs.update(tab.id, { url: newUrl.toString() })
    }
  }

  return (
    <div className="w-[320px] min-h-[200px] bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center border-b border-gray-200/60 pb-3">
          <div className="flex items-center gap-2">
            <SwitchCamera className="text-blue-500" size={20} />
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Domain Switcher
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="p-1.5 rounded-full hover:bg-white/80 hover:shadow-sm text-gray-600 hover:text-blue-500 transition-all duration-200">
              <Plus size={18} />
            </button>
            <button
              onClick={() => chrome.tabs.create({ url: "options.html" })}
              className="p-1.5 rounded-full hover:bg-white/80 hover:shadow-sm text-gray-600 hover:text-blue-500 transition-all duration-200">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {showQuickAdd ? (
            <div className="animate-fade-in">
              <QuickAddForm
                currentUrl={currentUrl}
                onAdd={async (group) => {
                  await addDomainGroup(group)
                  loadInitialData()
                  setShowQuickAdd(false)
                }}
                onCancel={() => setShowQuickAdd(false)}
              />
            </div>
          ) : hasMatch ? (
            <div className="flex flex-col gap-3 animate-fade-in">
              {domainGroups.map((group) => (
                <DomainGroupComponent
                  key={group.id}
                  group={group}
                  currentHost={currentUrl?.host}
                  onSwitch={handleSwitch}
                  onDelete={async (id) => {
                    await deleteDomainGroup(id)
                    loadInitialData()
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="animate-fade-in">
              <NoMatch onQuickAdd={() => setShowQuickAdd(true)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
