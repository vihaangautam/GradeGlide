import React, { useState } from 'react'
import {
    ArrowLeft,
    Check,
    X,
    MessageSquare,
    Save,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

// Mock Data for Grading
const MOCK_EXAM_DATA = {
    studentName: "Rahul Sharma",
    rollNo: "12C-42",
    subject: "Physics",
    totalMarks: 35,
    obtainedMarks: 28,
    status: "In Progress",
    questions: [
        {
            id: 1,
            question: "Define Ohm's Law.",
            maxMarks: 2,
            obtainedMarks: 2,
            aiRemark: "Correct definition provided.",
            status: "correct"
        },
        {
            id: 2,
            question: "Explain the working of a transformer.",
            maxMarks: 5,
            obtainedMarks: 3.5,
            aiRemark: "Diagram misses label for secondary coil. Explanation is good.",
            status: "partial"
        },
        {
            id: 3,
            question: "Calculate the equivalent resistance.",
            maxMarks: 3,
            obtainedMarks: 0,
            aiRemark: "Formula applied incorrectly.",
            status: "incorrect"
        }
    ]
}

const QuestionCard = ({ q, onUpdateMark }) => (
    <Card className={`mb-4 transition-all ${q.status === 'correct' ? 'border-l-4 border-l-green-500' : q.status === 'partial' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-red-500'}`}>
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">Q{q.id}. {q.question}</h4>
                <Badge variant="outline">{q.maxMarks} Marks</Badge>
            </div>

            <div className="bg-muted/30 p-3 rounded-md mb-3 text-sm text-muted-foreground">
                <span className="font-semibold text-primary/80 flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3 h-3" /> AI Remark:
                </span>
                {q.aiRemark}
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => onUpdateMark(q.id, Math.max(0, q.obtainedMarks - 0.5))}>
                        -
                    </Button>
                    <div className="w-16 text-center font-bold text-lg">
                        {q.obtainedMarks}
                    </div>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => onUpdateMark(q.id, Math.min(q.maxMarks, q.obtainedMarks + 0.5))}>
                        +
                    </Button>
                </div>
                <div className="flex gap-1">
                    <Button size="sm" variant={q.status === 'correct' ? 'default' : 'ghost'} className={q.status === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600'}>
                        <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant={q.status === 'incorrect' ? 'default' : 'ghost'} className={q.status === 'incorrect' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600'}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    </Card>
)

export default function GradingReview() {
    const { id } = useParams()
    const [data, setData] = useState(MOCK_EXAM_DATA)

    // Mock function to update marks
    const handleUpdateMark = (qid, newMark) => {
        const updatedQuestions = data.questions.map(q =>
            q.id === qid ? { ...q, obtainedMarks: newMark } : q
        )
        const newTotal = updatedQuestions.reduce((sum, q) => sum + q.obtainedMarks, 0)
        setData({ ...data, questions: updatedQuestions, obtainedMarks: newTotal })
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-4">
                    <Link to="/grading">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="font-bold text-lg">{data.studentName}</h2>
                        <p className="text-sm text-muted-foreground">{data.subject} • {data.rollNo}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                        <div className="text-sm text-muted-foreground">Total Score</div>
                        <div className="text-2xl font-bold text-primary">{data.obtainedMarks} <span className="text-muted-foreground text-sm font-normal">/ {data.totalMarks}</span></div>
                    </div>
                    <Button size="lg" className="gap-2">
                        <Save className="w-4 h-4" /> Finalize Grade
                    </Button>
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">

                {/* Left Side: Mock PDF Viewer */}
                <div className="bg-slate-100 rounded-lg border flex flex-col overflow-hidden relative group">
                    <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white/80 p-1 rounded-lg shadow-sm backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8"><ZoomOut className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><ZoomIn className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Maximize2 className="w-4 h-4" /></Button>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-200/50">
                        {/* Placeholder for Scanned Image */}
                        <div className="bg-white shadow-lg w-full max-w-[500px] h-[700px] p-8 flex flex-col gap-4 relative">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="text-red-500 font-handwriting text-4xl rotate-[-12deg] border-2 border-red-500 p-2 rounded-lg opacity-80">
                                    {data.obtainedMarks}/{data.totalMarks}
                                </div>
                            </div>

                            <h3 className="text-center font-serif text-xl border-b pb-4 mb-4">Physics Mid-Term Examination</h3>

                            {/* Mock Handwriting Content */}
                            <div className="space-y-8 font-handwriting text-slate-700">
                                <div>
                                    <p className="mb-2 font-bold text-black">Q1. Define Ohm's Law.</p>
                                    <p className="text-blue-900">Ohm's law states that the current flowing through a conductor is directly proportional to the potential difference applied across its ends, provided the temperature and other physical conditions remain unchanged.</p>
                                    <div className="text-green-600 text-sm mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Correct</div>
                                </div>

                                <div>
                                    <p className="mb-2 font-bold text-black">Q2. Explain the transformer.</p>
                                    <p className="text-blue-900">A transformer is a device used to change the voltage of alternating current. It works on the principle of mutual induction.</p>
                                    <div className="h-32 bg-slate-100 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-sm my-2">
                                        [Student Drawing of Transformer]
                                    </div>
                                    <div className="text-yellow-600 text-sm mt-1 flex items-center gap-1">⚠ Label Missing</div>
                                </div>

                                <div>
                                    <p className="mb-2 font-bold text-black">Q3. Calculate Resistance.</p>
                                    <p className="text-blue-900">R = V * I (Incorrect Formula)</p>
                                    <div className="text-red-600 text-sm mt-1 flex items-center gap-1"><X className="w-3 h-3" /> Formula Error</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-2 border-t flex justify-between items-center text-xs text-muted-foreground px-4">
                        <span>Page 1 of 3</span>
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-6 w-6"><ChevronLeft className="w-3 h-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6"><ChevronRight className="w-3 h-3" /></Button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Grading Panel */}
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="bg-muted/30 border rounded-lg p-1 mb-4 flex gap-1">
                        <Button variant="secondary" size="sm" className="flex-1 shadow-sm bg-white text-primary">AI Suggestions</Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">Rubric</Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground">Original Key</Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-1">
                        {data.questions.map(q => (
                            <QuestionCard key={q.id} q={q} onUpdateMark={handleUpdateMark} />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
