import { LearntimeContext } from "@/context/context"
import { createChats } from "@/db/chats"
import { IconUpload, IconX } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from "../ui/dialog"
import { Input } from "../ui/input"
import demoImport from "./demo_import.json"

interface ImportProps {
  demo_mode_text?: string
}

export const Import: FC<ImportProps> = ({ demo_mode_text }) => {
  const { profile, selectedWorkspace, setChats } = useContext(LearntimeContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [importList, setImportList] = useState<Array<Record<string, any>>>([])
  const [importCounts, setImportCounts] = useState<{
    chats: number
  }>({
    chats: 0
  })

  const handleSelectFiles = async (e: any) => {
    const filePromises = Array.from(e.target.files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = event => {
          try {
            const data = JSON.parse(event.target?.result as string)
            resolve(Array.isArray(data) ? data : [data])
          } catch (error) {
            reject(error)
          }
        }
        reader.readAsText(file as Blob)
      })
    })

    try {
      const results = await Promise.all(filePromises)
      const flatResults = results.flat()
      let uniqueResults: Array<Record<string, any>> = []
      setImportList(prevState => {
        const newState = [...prevState, ...flatResults]
        uniqueResults = Array.from(
          new Set(newState.map(item => JSON.stringify(item)))
        ).map(item => JSON.parse(item))
        return uniqueResults
      })

      setImportCounts(prevCounts => {
        const newCounts: any = { ...prevCounts }
        newCounts.chats = uniqueResults.filter(
          item => item.contentType === "chats"
        ).length
        return newCounts
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveItem = (item: any) => {
    setImportList(prev => prev.filter(prevItem => prevItem !== item))

    setImportCounts(prev => {
      const newCounts: any = { ...prev }
      newCounts.chats -= 1
      return newCounts
    })
  }

  const handleCancel = () => {
    setImportList([])
    setImportCounts({
      chats: 0
    })
    setIsOpen(false)
  }

  const handleSaveData = async () => {
    if (!profile) return
    if (!selectedWorkspace) return

    const saveData: any = {
      chats: []
    }

    importList.forEach(item => {
      const { contentType, ...itemWithoutContentType } = item
      if (contentType === "chats") {
        itemWithoutContentType.user_id = profile.user_id
        itemWithoutContentType.workspace_id = selectedWorkspace.id
        // ... add other necessary properties ...
        saveData.chats.push(itemWithoutContentType)
      }
    })

    const createdChats = await createChats(saveData.chats)
    setChats(prevChats => [...prevChats, ...createdChats])

    toast.success("Chats imported successfully!")

    setImportList([])
    setImportCounts({
      chats: 0
    })
    setIsOpen(false)
  }

  useEffect(() => {
    if (importList.length > 0 && demo_mode_text) {
      handleSaveData()
    }
  }, [importList])

  const handleDemoMode = () => {
    setImportList(demoImport)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      buttonRef.current?.click()
    }
  }

  return demo_mode_text ? (
    <Button variant="outline" onClick={handleDemoMode}>
      {demo_mode_text}
    </Button>
  ) : (
    <>
      <IconUpload
        className="cursor-pointer hover:opacity-50"
        size={SIDEBAR_ICON_SIZE}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className="max-w-[600px] space-y-4"
            onKeyDown={handleKeyDown}
          >
            <DialogHeader>
              <div className="text-2xl font-bold">Import Data</div>

              <DialogDescription>
                Import data from a JSON file(s).
              </DialogDescription>
            </DialogHeader>

            <div className="max-w-[560px] space-y-4">
              <div className="space-y-1">
                {importList.map((item, index) => (
                  <div key={index} className="flex space-x-2">
                    <Button className="shrink-0" variant="ghost" size="icon">
                      <IconX
                        className="cursor-pointer hover:opacity-50"
                        onClick={() => handleRemoveItem(item)}
                      />
                    </Button>

                    <div className="flex items-center space-x-2 truncate">
                      <Badge>Topic</Badge>

                      <div className="truncate">{item.name}</div>
                    </div>
                  </div>
                ))}
              </div>

              {Object.entries(importCounts).map(([key, value]) => {
                if (value > 0) {
                  return <div key={key}>{`${key}: ${value}`}</div>
                }
                return null
              })}

              <Input
                className="mt-4"
                ref={inputRef}
                type="file"
                onChange={handleSelectFiles}
                accept=".json"
                multiple
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>

              <Button
                ref={buttonRef}
                onClick={handleSaveData}
                disabled={importList.length === 0}
              >
                Save Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
