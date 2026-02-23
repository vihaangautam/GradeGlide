import React, { useState } from 'react'
import {
    User,
    Bell,
    Shield,
    Palette,
    BookOpen,
    Save,
    Moon,
    Sun,
    Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SettingsSection = ({ icon: Icon, title, description, children }) => (
    <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
            <div className="p-2 bg-primary/10 rounded-lg mt-1">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="pl-[4.5rem] space-y-4">{children}</CardContent>
    </Card>
)

const Toggle = ({ label, sublabel, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-1">
        <div>
            <p className="text-sm font-medium">{label}</p>
            {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        <button
            onClick={onToggle}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                enabled ? 'bg-primary' : 'bg-muted'
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform',
                    enabled ? 'translate-x-6' : 'translate-x-1'
                )}
            />
        </button>
    </div>
)

const FieldRow = ({ label, placeholder, value }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <input
            defaultValue={value}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
    </div>
)

export default function Settings() {
    const [notifications, setNotifications] = useState({
        grading: true,
        reports: false,
        digest: true
    })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
            </div>

            {/* Profile */}
            <SettingsSection icon={User} title="Profile" description="Update your personal information.">
                <FieldRow label="Full Name" value="Arun Kumar" />
                <FieldRow label="Email" value="arun.kumar@school.edu" />
                <FieldRow label="School / Institution" value="Delhi Public School" />
                <Button className="mt-2 gap-2" size="sm">
                    <Save className="w-4 h-4" /> Save Changes
                </Button>
            </SettingsSection>

            {/* Notifications */}
            <SettingsSection icon={Bell} title="Notifications" description="Control when and how you get notified.">
                <Toggle
                    label="Grading Complete"
                    sublabel="Notify when a batch is done processing"
                    enabled={notifications.grading}
                    onToggle={() => setNotifications(n => ({ ...n, grading: !n.grading }))}
                />
                <Toggle
                    label="Weekly Reports"
                    sublabel="Get weekly class performance summaries"
                    enabled={notifications.reports}
                    onToggle={() => setNotifications(n => ({ ...n, reports: !n.reports }))}
                />
                <Toggle
                    label="Daily Digest"
                    sublabel="Quick overview of pending tasks each morning"
                    enabled={notifications.digest}
                    onToggle={() => setNotifications(n => ({ ...n, digest: !n.digest }))}
                />
            </SettingsSection>

            {/* AI Preferences */}
            <SettingsSection icon={BookOpen} title="AI Preferences" description="Customize how GradeGlide's AI works for you.">
                <div className="space-y-1">
                    <label className="text-sm font-medium">Default Grading Strictness</label>
                    <select className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>Lenient — partial credit for most answers</option>
                        <option selected>Balanced — standard grading</option>
                        <option>Strict — marks only fully correct answers</option>
                    </select>
                </div>
                <Toggle
                    label="Show AI Remarks"
                    sublabel="Display AI-generated comments per question"
                    enabled={true}
                    onToggle={() => { }}
                />
            </SettingsSection>

            {/* Account & Security */}
            <SettingsSection icon={Shield} title="Security" description="Manage your password and account safety.">
                <FieldRow label="Current Password" placeholder="••••••••" />
                <FieldRow label="New Password" placeholder="••••••••" />
                <Button variant="outline" size="sm" className="mt-2">
                    Update Password
                </Button>
            </SettingsSection>
        </div>
    )
}
