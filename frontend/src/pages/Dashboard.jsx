import React from 'react'
import {
    CheckCircle2,
    Key,
    FileText,
    ArrowRight,
    MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

const MetricCard = ({ title, value, subtext, subtextClass }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold">{value}</div>
                {subtext && <span className={`text-xs ${subtextClass}`}>{subtext}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">this month</p>
        </CardContent>
    </Card>
)

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

const ActivityItem = ({ title, subject, classInfo, date, score, total, status }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${subject.includes('Physics') ? 'bg-blue-100 text-blue-600' :
                    subject.includes('Chemistry') ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                }`}>
                <FileText className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-medium text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground">
                    {subject} • {classInfo} • {date}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <span className="font-bold text-sm">{score}/{total}</span>
            </div>
            <Badge variant={status === 'Reviewed' ? 'success' : 'warning'}>
                {status}
            </Badge>
        </div>
    </div>
)

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Good morning, Arun 👋</h2>
                    <p className="text-muted-foreground mt-1">Here's what's happening with your classes.</p>
                </div>
                <Button variant="outline">
                    View Reports
                </Button>
            </div>

            {/* Metrics Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard title="Papers Graded" value="47" subtext="+12%" subtextClass="text-green-600 font-bold" />
                <MetricCard title="Answer Keys" value="12" subtext="generated" subtextClass="text-muted-foreground" />
                <MetricCard title="Question Papers" value="8" subtext="created" subtextClass="text-muted-foreground" />
            </div>

            {/* Quick Actions Section */}
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

            {/* Recent Activity Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        View all
                    </Button>
                </div>

                <div className="space-y-3">
                    <ActivityItem
                        title="Rahul Sharma — Physics Mid-Term"
                        subject="Physics"
                        classInfo="Class 10"
                        date="2026-02-08"
                        score="62"
                        total="80"
                        status="Reviewed"
                    />
                    <ActivityItem
                        title="Priya Patel — Chemistry Unit Test"
                        subject="Chemistry"
                        classInfo="Class 10"
                        date="2026-02-08"
                        score="-"
                        total="-"
                        status="Pending"
                    />
                    <ActivityItem
                        title="Amit Kumar — Mathematics Quiz"
                        subject="Mathematics"
                        classInfo="Class 9"
                        date="2026-02-07"
                        score="18"
                        total="20"
                        status="Reviewed"
                    />
                </div>
            </div>
        </div>
    )
}
