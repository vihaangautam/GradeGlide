import React from 'react'
import { Bell } from 'lucide-react'

export default function Header() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10 backdrop-blur pb-0">
            <div className="w-full flex-1">
                {/* Search or Breadcrumbs could go here */}
            </div>
            <button className="relative size-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
            </button>
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    AK
                </div>
            </div>
        </header>
    )
}
