import { ContentType } from "@/types"
import { FC } from "react"
import { SIDEBAR_WIDTH } from "../ui/dashboard"
import { WorkspaceSwitcher } from "../utility/workspace-switcher"
import { WorkspaceSettings } from "../workspace/workspace-settings"
import { SidebarContent } from "./sidebar-content"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"

interface SidebarProps {
  contentType: ContentType
  showSidebar: boolean
}

export const Sidebar: FC<SidebarProps> = ({ contentType, showSidebar }) => {
  return (
    <div className="flex size-full flex-col border-r-2 pb-3">
      <div
        className="flex-1 flex-col overflow-y-auto"
        style={{
          // Sidebar - SidebarSwitcher
          minWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px)` : "0px",
          maxWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px)` : "0px",
          width: showSidebar ? `calc(${SIDEBAR_WIDTH}px)` : "0px"
        }}
      >
        <div className="flex h-full flex-col p-3">
          <div className="flex items-center border-b-2 pb-2">
            <WorkspaceSwitcher />

            <WorkspaceSettings />
          </div>

          <SidebarContent />
        </div>
      </div>

      <div className="flex flex-col px-3  empty:hidden">
        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />
      </div>
    </div>
  )
}
