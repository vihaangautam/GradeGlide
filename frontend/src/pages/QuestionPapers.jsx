import React, { useState } from 'react'
import {
    FileText,
    Plus,
    Search,
    Sparkles,
    Eye,
    Download,
    Trash2,
    BookOpen,
    Clock,
    ListChecks
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MOCK_PAPERS = [
    {
        id: 1,
        title: 'Physics Final Exam',
        subject: 'Physics',
        classInfo: 'Class 12C',
        questions: 20,
        duration: '3 hrs',
        totalMarks: 70,
        createdAt: 'Feb 19, 2026',
        difficulty: 'Hard',
    },
    {
        id: 2,
        title: 'Chemistry Unit Test',
        subject: 'Chemistry',
        classInfo: 'Class 10B',
        questions: 10,
        duration: '1 hr',
        totalMarks: 30,
        createdAt: 'Feb 16, 2026',
        difficulty: 'Medium',
    },
    {
        id: 3,
        title: 'Mathematics Weekly Quiz',
        subject: 'Mathematics',
        classInfo: 'Class 9A',
        questions: 5,
        duration: '30 min',
        totalMarks: 20,
        createdAt: 'Feb 13, 2026',
        difficulty: 'Easy',
    },
]

const difficultyVariant = (d) => {
    if (d === 'Hard') return 'destructive'
    if (d === 'Medium') return 'warning'
    return 'success'
}

const subjectColor = (subject) => {
    if (subject.includes('Physics')) return 'bg-blue-100 text-blue-600'
    if (subject.includes('Chemistry')) return 'bg-orange-100 text-orange-600'
    if (subject.includes('Math')) return 'bg-purple-100 text-purple-600'
    return 'bg-green-100 text-green-600'
}

export default function QuestionPapers() {
    const [search, setSearch] = useState('')
    const filtered = MOCK_PAPERS.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Question Papers</h2>
                    <p className="text-muted-foreground mt-1">Create AI-powered question papers in seconds.</p>
                </div>
                <Button className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Paper
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Papers Created</p>
                            <p className="text-2xl font-bold">8</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <ListChecks className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Questions</p>
                            <p className="text-2xl font-bold">120</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Subjects Covered</p>
                            <p className="text-2xl font-bold">5</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search + List */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Search question papers..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    {filtered.map(paper => (
                        <div
                            key={paper.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${subjectColor(paper.subject)}`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">{paper.title}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                                        {paper.classInfo} • {paper.questions} Qs • {paper.totalMarks} Marks
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {paper.duration}
                                        </span>
                                        • {paper.createdAt}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={difficultyVariant(paper.difficulty)}>
                                    {paper.difficulty}
                                </Badge>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Download className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No question papers found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
