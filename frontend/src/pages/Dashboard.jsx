import React, { useState, useEffect } from 'react'
import {
    CheckCircle2,
    Key,
    FileText,
    ArrowRight,
    Loader2,
    AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

const BACKEND = 'http://localhost:8000'

// ── Metric Card ────────────────────────────────────────────────────────────────
const MetricCard = ({ title, value, subtext, subtextClass, loading }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
                <div className="flex items-baseline space-x-2">
                    <div className="text-2xl font-bold">{value}</div>
                    {subtext && <span className={`text-xs ${subtextClass}`}>{subtext}</span>}
                </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">this month</p>
        </CardContent>
    </Card>
)

// ── Quick Action Card ──────────────────────────────────────────────────────────
const ActionCard = ({ title, description, icon: Icon, href, primary = false }) => (
    <Link to={href} className="block group">
        <Card className={`h-full transition-all hover:shadow-md ${primary ? 'bg-primary text-primary-foreground border-primary' : 'hover:border-primary/50'}`}>
            <CardContent className="p-6 flex flex-col items-start justify-between h-full space-y-4">
                <div className={`p-2 rounded-full ${primary ? 'bg-white/20' : 'bg-primary/10'}`}>
                    <Icon className={`w-6 h-6 ${primary ? 'text-white' : 'text-primary'}`} />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        {title}
                        <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${primary ? 'text-white' : 'text-muted-foreground'}`} />
                    </h3>
                    <p className={`text-sm ${primary ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    </Link>
)

// ── Subject colour mapping ─────────────────────────────────────────────────────
const SUBJECT_COLOR = (subject = '') => {
    const s = subject.toLowerCase()
    if (s.includes('physics')) return 'bg-blue-100 text-blue-600'
    if (s.includes('chemistry')) return 'bg-orange-100 text-orange-600'
    if (s.includes('math')) return 'bg-green-100 text-green-600'
    if (s.includes('biology')) return 'bg-emerald-100 text-emerald-600'
    if (s.includes('english')) return 'bg-pink-100 text-pink-600'
    return 'bg-purple-100 text-purple-600'
}

// ── Activity Row ───────────────────────────────────────────────────────────────
const ActivityItem = ({ id, examTitle, studentName, subject, obtainedMarks, totalMarks, status, createdAt }) => (
    <Link to={`/grading/${id}`} className="block group">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${SUBJECT_COLOR(subject)}`}>
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-medium text-sm">{examTitle || `${studentName} — ${subject}`}</h4>
                    <p className="text-xs text-muted-foreground">
                        {subject} • {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <span className="font-bold text-sm">
                        {obtainedMarks != null ? `${obtainedMarks}/${totalMarks}` : '—'}
                    </span>
                </div>
                <Badge variant={status === 'completed' ? 'success' : status === 'processing' ? 'secondary' : 'warning'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            </div>
        </div>
    </Link>
)

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyActivity = () => (
    <div className="text-center py-10 text-muted-foreground space-y-2">
        <FileText className="w-10 h-10 mx-auto opacity-20" />
        <p className="text-sm">No grading sessions yet.</p>
        <Link to="/grading">
            <Button variant="outline" size="sm" className="mt-1">Upload your first paper</Button>
        </Link>
    </div>
)

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [offline, setOffline] = useState(false)

    useEffect(() => {
        fetch(`${BACKEND}/sessions/stats`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => { setStats(data); setOffline(false) })
            .catch(() => {
                // Backend offline — show zeros but keep UI functional
                setStats({
                    totalPapersGraded: 0,
                    completed: 0,
                    processing: 0,
                    uniqueSubjects: 0,
                    recentSessions: [],
                })
                setOffline(true)
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard 👋</h2>
                    <p className="text-muted-foreground mt-1">Here's what's happening with your classes.</p>
                </div>
                <Link to="/grading">
                    <Button variant="outline">Grade Papers</Button>
                </Link>
            </div>

            {/* Offline banner */}
            {offline && !loading && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Backend offline — showing empty state. Start the backend with{' '}
                    <code className="font-mono bg-amber-100 px-1 rounded text-xs">
                        uvicorn main:app --reload
                    </code>
                </div>
            )}

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    loading={loading}
                    title="Papers Graded"
                    value={stats?.totalPapersGraded ?? 0}
                    subtext={stats?.completed != null ? `${stats.completed} completed` : undefined}
                    subtextClass="text-green-600 font-semibold"
                />
                <MetricCard
                    loading={loading}
                    title="In Progress"
                    value={stats?.processing ?? 0}
                    subtext="uploading / processing"
                    subtextClass="text-muted-foreground"
                />
                <MetricCard
                    loading={loading}
                    title="Subjects Covered"
                    value={stats?.uniqueSubjects ?? 0}
                    subtext="unique subjects"
                    subtextClass="text-muted-foreground"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
                <ActionCard
                    title="Grade Papers"
                    description="Upload & review answer sheets"
                    icon={CheckCircle2}
                    href="/grading"
                    primary={true}
                />
                <ActionCard
                    title="Generate Answer Key"
                    description="From question paper"
                    icon={Key}
                    href="/answer-keys"
                />
                <ActionCard
                    title="Create Question Paper"
                    description="AI-powered generation"
                    icon={FileText}
                    href="/question-papers"
                />
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <Link to="/grading">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            View all
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading activity…
                    </div>
                ) : stats?.recentSessions?.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recentSessions.map(s => (
                            <ActivityItem key={s.id} {...s} />
                        ))}
                    </div>
                ) : (
                    <EmptyActivity />
                )}
            </div>
        </div>
    )
}
