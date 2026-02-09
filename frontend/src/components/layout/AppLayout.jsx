import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col md:pl-[240px] lg:pl-[280px] min-h-screen transition-all duration-300 ease-in-out">
                <Header />
                <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
