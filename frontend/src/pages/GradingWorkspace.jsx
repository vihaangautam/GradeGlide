import React, { useState, useRef, useEffect } from 'react'
import {
    Upload,
    Search,
    FileCheck,
    ArrowRight,
    FileText,
    Loader2,
    UploadCloud,
    CheckCircle,
    AlertCircle,
    Download,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link, useNavigate } from 'react-router-dom'

const BACKEND = 'http://localhost:8000'

const STATUS_COLOR = {
    completed: 'success',
    ready: 'default',
    processing: 'secondary',
    pending: 'secondary',
    error: 'destructive',
}

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }) {
    const [file, setFile] = useState(null)
    const [status, setStatus] = useState('idle') // idle | uploading | done | error
    const [errorMsg, setErrorMsg] = useState('')
    const [answerKeys, setAnswerKeys] = useState([])
    const [selectedKeyId, setSelectedKeyId] = useState('')
    const [keysLoading, setKeysLoading] = useState(true)
    const inputRef = useRef()

    // Fetch available answer keys on mount
    useEffect(() => {
        fetch(`${BACKEND}/answer-keys`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setAnswerKeys(data); if (data.length > 0) setSelectedKeyId(data[0].id) })
            .catch(() => setAnswerKeys([]))
            .finally(() => setKeysLoading(false))
    }, [])

    const handleDrop = (e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f) setFile(f)
    }

    const handleUpload = async () => {
        if (!file) return
        setStatus('uploading')
        try {
            const form = new FormData()
            form.append('answer_sheet', file)
            if (selectedKeyId) form.append('answer_key_id', selectedKeyId)
            const res = await fetch(`${BACKEND}/upload/session`, { method: 'POST', body: form })
            if (!res.ok) throw new Error(`Server error ${res.status}`)
            const data = await res.json()
            setStatus('done')
            setTimeout(() => { onSuccess(data.session_id); onClose() }, 1200)
        } catch (err) {
            setStatus('error')
            setErrorMsg(err.message)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold">Upload Answer Sheet</h3>
                <p className="text-sm text-muted-foreground">
                    Upload a scanned PDF or photo of a student's answer sheet. AI will automatically grade it.
                </p>

                {/* Answer Key selector */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Marking Scheme (Answer Key)</label>
                    {keysLoading ? (
                        <div className="h-9 bg-muted animate-pulse rounded-md" />
                    ) : answerKeys.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            No answer keys saved yet — will use built-in Physics demo scheme.
                            <a href="/answer-keys" className="underline font-medium ml-1">Create one →</a>
                        </div>
                    ) : (
                        <select
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={selectedKeyId}
                            onChange={e => setSelectedKeyId(e.target.value)}
                        >
                            {answerKeys.map(k => (
                                <option key={k.id} value={k.id}>
                                    {k.title} ({k.questionCount} Qs · {k.totalMarks} marks)
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Drop zone */}
                <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-colors"
                >
                    {file ? (
                        <div className="space-y-1">
                            <FileText className="w-8 h-8 text-primary mx-auto" />
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto" />
                            <p className="text-sm font-medium">Drop file here or click to browse</p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG supported</p>
                        </div>
                    )}
                    <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden" onChange={e => setFile(e.target.files[0])} />
                </div>

                {status === 'error' && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorMsg || 'Upload failed. Is the backend running?'}
                    </div>
                )}
                {status === 'done' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" /> Uploaded! Redirecting…
                    </div>
                )}

                <div className="flex gap-3 pt-1">
                    <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1 gap-2" onClick={handleUpload}
                        disabled={!file || status === 'uploading' || status === 'done'}>
                        {status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {status === 'uploading' ? 'Uploading…' : 'Start Grading'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ── Session list item ─────────────────────────────────────────────────────────
const SessionItem = ({ id, studentName, subject, examTitle, status, obtainedMarks, totalMarks, createdAt }) => (
    <Link to={`/grading/${id}`} className="block">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-lg group-hover:bg-white transition-colors">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                    <h4 className="font-medium">{examTitle || 'Untitled Exam'}</h4>
                    <p className="text-sm text-muted-foreground">
                        {studentName} • {subject} • {new Date(createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {obtainedMarks != null && (
                    <span className="text-sm font-semibold text-primary">
                        {obtainedMarks}/{totalMarks}
                    </span>
                )}
                <Badge variant={STATUS_COLOR[status] || 'secondary'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
                {/* CSV download — stops propagation so it doesn't navigate */}
                <button
                    title="Download CSV"
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        const a = document.createElement('a')
                        a.href = `${BACKEND}/sessions/${id}/export?format=csv`
                        a.download = `gradeglide_${id.slice(0, 8)}.csv`
                        a.click()
                    }}
                >
                    <Download className="w-4 h-4" />
                </button>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </Link>
)

// ── Fallback mock items when backend is offline ───────────────────────────────
const MOCK_ITEMS = [
    { id: 'batch-1', studentName: 'Demo Student', subject: 'Physics', examTitle: 'Final Exam — Physics', status: 'ready', obtainedMarks: 7, totalMarks: 10, createdAt: new Date().toISOString() },
    { id: 'batch-2', studentName: 'Demo Student 2', subject: 'Chemistry', examTitle: 'Mid-Term Quiz — Chemistry', status: 'completed', obtainedMarks: 10, totalMarks: 10, createdAt: new Date(Date.now() - 86400000).toISOString() },
]

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GradingWorkspace() {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showUpload, setShowUpload] = useState(false)
    const [backendOnline, setBackendOnline] = useState(true)

    const loadSessions = () => {
        setLoading(true)
        fetch(`${BACKEND}/sessions`)
            .then(r => r.json())
            .then(data => { setSessions(data); setBackendOnline(true) })
            .catch(() => { setSessions(MOCK_ITEMS); setBackendOnline(false) })
            .finally(() => setLoading(false))
    }

    useEffect(() => { loadSessions() }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={(sessionId) => {
                        loadSessions()
                        navigate(`/grading/${sessionId}`)
                    }}
                />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Grading Workspace</h2>
                    <p className="text-muted-foreground mt-1">
                        {backendOnline
                            ? 'Upload answer sheets and let AI grade them instantly.'
                            : '⚠️ Backend offline — showing demo data. Run uvicorn main:app --reload in /backend'}
                    </p>
                </div>
                <Button onClick={() => setShowUpload(true)}>
                    <Upload className="mr-2 h-4 w-4" /> New Grading Batch
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: 'Upload Papers', desc: 'Upload scanned PDFs or photos of answer sheets.', icon: Upload, primary: true },
                    { title: 'AI Analysis', desc: 'Gemini reads handwriting and grades step-by-step.', icon: Search },
                    { title: 'Review Results', desc: 'Verify grades and export results as CSV.', icon: FileCheck },
                ].map(({ title, desc, icon: Icon, primary }) => (
                    <Card key={title} className={`transition-all hover:shadow-md ${primary ? 'border-primary/50' : ''}`}>
                        <CardContent className="p-6 flex flex-col items-start space-y-4">
                            <div className={`p-3 rounded-lg ${primary ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{title}</h3>
                                <p className="text-sm text-muted-foreground">{desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="p-1 rounded bg-muted/50"><FileCheck className="w-4 h-4" /></span>
                    Recent Grading Sessions
                </h3>
                {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading sessions…
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Upload className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No grading sessions yet. Upload your first answer sheet!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map(s => <SessionItem key={s.id} {...s} />)}
                    </div>
                )}
            </div>
        </div>
    )
}
