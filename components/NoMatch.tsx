import { Plus } from "lucide-react"

interface Props {
  onQuickAdd: () => void
}

export default function NoMatch({ onQuickAdd }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col items-center gap-6">
        <div
          onClick={onQuickAdd}
          className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100  hover:shadow-md transition-all duration-300">
          <Plus className="w-7 h-7" />
        </div>
        <div className="space-y-5">
          <p className="text-gray-600 text-lg font-light">
            Current domain is not configured in any group
          </p>
        </div>
      </div>
    </div>
  )
}
