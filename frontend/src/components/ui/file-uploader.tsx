import * as React from 'react'
import { Paperclip, Loader2, File as FileIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; file: { name: string; url: string } }

interface FileUploaderProps {
  onUpload: (file: File) => void
  onRemove: () => void
  state: UploadState
}

export function FileUploader({ onUpload, onRemove, state }: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
  }

  if (state.status === 'uploading') {
    return (
      <Button variant="outline" disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Mengunggah...
      </Button>
    )
  }

  if (state.status === 'success') {
    return (
      <div className="flex items-center justify-between rounded-md border p-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">{state.file.name}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        <Paperclip className="mr-2 h-4 w-4" />
        Lampirkan Bukti
      </Button>
    </>
  )
}
