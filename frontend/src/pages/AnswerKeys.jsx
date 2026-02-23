import React, { useState } from 'react'
import {
    Key,
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Trash2,
    Download,
    FileText,
    Sparkles,
    ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MOCK_KEYS = [
    {
        id: 1,
        title: 'Physics Mid-Term — Class 12C',
        subject: 'Physics',
        classInfo: 'Class 12C',
        questions: 15,
        createdAt: 'Feb 20, 2026',
        source: 'AI Generated',
    },
    {
        id: 2,
        title: 'Chemistry Unit Test — Class 10B',
        subject: 'Chemistry',
        classInfo: 'Class 10B',
        questions: 10,
        createdAt: 'Feb 18, 2026',
        source: 'Manual',
    },
    {
        id: 3,
        title: 'Mathematics Quiz — Class 9A',
        subject: 'Mathematics',
        classInfo: 'Class 9A',
        questions: 8,
        createdAt: 'Feb 15, 2026',
        source: 'AI Generated',
    },
]

const subjectColor = (subject) => {
    if (subject.includes('Physics')) return 'bg-blue-100 text-blue-600'
    if (subject.includes('Chemistry')) return 'bg-orange-100 text-orange-600'
    if (subject.includes('Math')) return 'bg-purple-100 text-purple-600'
    return 'bg-green-100 text-green-600'
}

export default function AnswerKeys() {
    const [search, setSearch] = useState('')
    const filtered = MOCK_KEYS.filter(k =>
        k.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Answer Keys</h2>
                    <p className="text-muted-foreground mt-1">Generate and manage answer keys for your exams.</p>
                </div>
                <Button className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Key className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Keys</p>
                            <p className="text-2xl font-bold">12</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Sparkles className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">AI Generated</p>
                            <p className="text-2xl font-bold">9</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <FileText className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Linked to Exams</p>
                            <p className="text-2xl font-bold">8</p>
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
                        placeholder="Search answer keys..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-3">
                    {filtered.map(key => (
                        <div
                            key={key.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${subjectColor(key.subject)}`}>
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">{key.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {key.questions} Questions • {key.classInfo} • {key.createdAt}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={key.source === 'AI Generated' ? 'secondary' : 'outline'}>
                                    {key.source}
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
                            <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No answer keys found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
