import React from 'react'
import {
    Upload,
    Search,
    FileCheck,
    ArrowRight,
    FileText
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'

const ActionCard = ({ title, description, icon: Icon, actionText, primary = false }) => (
    <Card className={`transition-all hover:shadow-md ${primary ? 'border-primary/50' : ''}`}>
        <CardContent className="p-6 flex flex-col items-start space-y-4">
            <div className={`p-3 rounded-lg ${primary ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
        </CardContent>
    </Card>
)

const BatchItem = ({ title, classInfo, date, papers, status, id }) => (
    <Link to={`/grading/${id}`} className="block">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-lg group-hover:bg-white transition-colors">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-sm text-muted-foreground">
                        {classInfo} • {date} • {papers} Papers
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant={status === 'Completed' ? 'success' : 'secondary'}>
                    {status}
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </Link>
)

export default function GradingWorkspace() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Grading Workspace</h2>
                    <p className="text-muted-foreground mt-1">Batch grade papers with AI assistance.</p>
                </div>
                <Button>
                    <Upload className="mr-2 h-4 w-4" /> New Grading Batch
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <ActionCard
                    title="Upload Papers"
                    description="Upload scanned PDFs or images of student answer sheets."
                    icon={Upload}
                    primary={true}
                />
                <ActionCard
                    title="AI Analysis"
                    description="Our AI identifies questions and matches them with answer keys."
                    icon={Search}
                />
                <ActionCard
                    title="Review Results"
                    description="Verify grades and provide feedback to students."
                    icon={FileCheck}
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="p-1 rounded bg-muted/50"><FileCheck className="w-4 h-4" /></span>
                    Recent Grading History
                </h3>

                <div className="space-y-3">
                    <BatchItem
                        id="batch-1"
                        title="Final Exam — Physics"
                        classInfo="Class 12C"
                        date="Today"
                        papers="42"
                        status="In Progress"
                    />
                    <BatchItem
                        id="batch-2"
                        title="Mid-Term Quiz — Chemistry"
                        classInfo="Class 10B"
                        date="Yesterday"
                        papers="28"
                        status="Completed"
                    />
                </div>
            </div>
        </div>
    )
}
