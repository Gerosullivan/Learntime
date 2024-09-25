import { useState, useContext } from "react"
import { SidebarDataList } from "./sidebar-data-list"
import { SidebarSearch } from "./sidebar-search"
import { SidebarCreateButtons } from "./sidebar-create-buttons"
import { LearntimeContext } from "@/context/context"

export const SidebarContent = () => {
  const { chats } = useContext(LearntimeContext)

  const [searchTerm, setSearchTerm] = useState("")

  const filteredData: any = chats.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    // Subtract 50px for the height of the workspace settings
    <div className="flex max-h-[calc(100%-50px)] grow flex-col">
      <div className="mt-2 flex items-center">
        <SidebarCreateButtons />
      </div>

      <div className="mt-2">
        <SidebarSearch
          contentType={"chats"}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      <SidebarDataList data={filteredData} />
    </div>
  )
}
