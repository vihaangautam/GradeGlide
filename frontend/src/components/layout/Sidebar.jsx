import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    CheckCircle2,
    Key,
    FileText,
    CreditCard,
    Settings,
    GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
            )
        }
    >
        <Icon className="h-4 w-4" />
        {children}
    </NavLink>
)

export default function Sidebar() {
    return (
        <div className="hidden border-r bg-muted/40 md:block w-[240px] lg:w-[280px] h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <div className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="">GradeGlide</span>
                    </div>
                </div>

                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                        <div className="pb-2 pt-4">
                            <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
                        </div>

                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Workspace
                        </div>
                        <NavItem to="/grading" icon={CheckCircle2}>Grading</NavItem>
                        <NavItem to="/answer-keys" icon={Key}>Answer Keys</NavItem>
                        <NavItem to="/question-papers" icon={FileText}>Question Papers</NavItem>

                        <div className="px-3 py-2 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Other
                        </div>
                        <NavItem to="/pricing" icon={CreditCard}>Pricing</NavItem>
                        <NavItem to="/settings" icon={Settings}>Settings</NavItem>
                    </nav>
                </div>
            </div>
        </div>
    )
}
