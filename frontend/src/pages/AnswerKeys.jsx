import React, { useState, useEffect, useCallback } from 'react'
import {
    Key,
    Plus,
    Search,
    Trash2,
    ChevronDown,
    ChevronUp,
    UploadCloud,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    X,
    FileText,
    Pencil,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const BACKEND = 'http://localhost:8000'

const SUBJECT_COLOR = (subject = '') => {
    const s = subject.toLowerCase()
    if (s.includes('physics')) return 'bg-blue-100 text-blue-600'
    if (s.includes('chem')) return 'bg-orange-100 text-orange-600'
    if (s.includes('math')) return 'bg-purple-100 text-purple-600'
    if (s.includes('bio')) return 'bg-emerald-100 text-emerald-600'
    if (s.includes('english')) return 'bg-pink-100 text-pink-600'
    return 'bg-indigo-100 text-indigo-600'
}

const Q_TYPES = ['SHORT_ANSWER', 'LONG_ANSWER', 'NUMERICAL']

// ── Editable Question Table ───────────────────────────────────────────────────
function QuestionEditor({ questions, onChange }) {
    const addQuestion = () => {
        const next = questions.length + 1
        onChange([...questions, { q_number: next, type: 'SHORT_ANSWER', text: '', max_marks: 2, steps: [] }])
    }

    const updateQ = (idx, field, value) => {
        const updated = questions.map((q, i) =>
            i === idx ? { ...q, [field]: value } : q
        )
        onChange(updated)
    }

    const removeQ = (idx) => {
        onChange(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, q_number: i + 1 })))
    }

    const addStep = (qIdx) => {
        const q = questions[qIdx]
        const key = String.fromCharCode(97 + q.steps.length) // a, b, c …
        updateQ(qIdx, 'steps', [...q.steps, { step_key: key, label: '', max_marks: 1 }])
    }

    const updateStep = (qIdx, sIdx, field, value) => {
        const steps = questions[qIdx].steps.map((s, i) =>
            i === sIdx ? { ...s, [field]: value } : s
        )
        updateQ(qIdx, 'steps', steps)
    }

    const removeStep = (qIdx, sIdx) => {
        const steps = questions[qIdx].steps.filter((_, i) => i !== sIdx)
            .map((s, i) => ({ ...s, step_key: String.fromCharCode(97 + i) }))
        updateQ(qIdx, 'steps', steps)
    }

    return (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {questions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No questions yet — add one below or wait for AI extraction.
                </p>
            )}
            {questions.map((q, qIdx) => (
                <div key={qIdx} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                    {/* Question row */}
                    <div className="flex gap-2 items-start">
                        <span className="text-xs font-bold text-muted-foreground pt-2 w-6 shrink-0">Q{q.q_number}</span>
                        <input
                            className="flex-1 text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="Question text…"
                            value={q.text}
                            onChange={e => updateQ(qIdx, 'text', e.target.value)}
                        />
                        <select
                            className="text-xs border rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                            value={q.type}
                            onChange={e => {
                                updateQ(qIdx, 'type', e.target.value)
                                if (e.target.value === 'SHORT_ANSWER') updateQ(qIdx, 'steps', [])
                            }}
                        >
                            {Q_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </select>
                        <div className="flex items-center gap-1">
                            <input
                                type="number" min={0} max={100} step={0.5}
                                className="w-14 text-sm border rounded-md px-2 py-1.5 text-center focus:outline-none focus:ring-1 focus:ring-ring"
                                value={q.max_marks}
                                onChange={e => updateQ(qIdx, 'max_marks', parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                        <button onClick={() => removeQ(qIdx)} className="text-destructive hover:bg-destructive/10 rounded p-1 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Steps (for LONG_ANSWER / NUMERICAL) */}
                    {q.type !== 'SHORT_ANSWER' && (
                        <div className="ml-8 space-y-1.5">
                            {q.steps.map((s, sIdx) => (
                                <div key={sIdx} className="flex gap-2 items-center">
                                    <span className="text-[10px] font-semibold text-muted-foreground w-4">{s.step_key})</span>
                                    <input
                                        className="flex-1 text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                                        placeholder="Step description…"
                                        value={s.label}
                                        onChange={e => updateStep(qIdx, sIdx, 'label', e.target.value)}
                                    />
                                    <input
                                        type="number" min={0} max={20} step={0.5}
                                        className="w-12 text-xs border rounded px-1.5 py-1 text-center focus:outline-none focus:ring-1 focus:ring-ring"
                                        value={s.max_marks}
                                        onChange={e => updateStep(qIdx, sIdx, 'max_marks', parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="text-[10px] text-muted-foreground">pts</span>
                                    <button onClick={() => removeStep(qIdx, sIdx)} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => addStep(qIdx)}
                                className="text-xs text-primary hover:underline ml-4"
                            >
                                + Add Step
                            </button>
                        </div>
                    )}
                </div>
            ))}
            <button
                onClick={addQuestion}
                className="w-full py-2 border-2 border-dashed border-primary/30 rounded-lg text-sm text-primary hover:bg-primary/5 hover:border-primary/60 transition-colors"
            >
                + Add Question
            </button>
        </div>
    )
}


// ── Create / Extract Modal ────────────────────────────────────────────────────
function CreateModal({ onClose, onCreated }) {
    // step: 'upload' | 'edit' | 'saving'
    const [step, setStep] = useState('upload')
    const [file, setFile] = useState(null)
    const [extracting, setExtracting] = useState(false)
    const [extractError, setExtractError] = useState(null)
    const [questions, setQuestions] = useState([])
    const [title, setTitle] = useState('')
    const [subject, setSubject] = useState('')
    const [examTitle, setExamTitle] = useState('')
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState(null)
    const fileRef = React.useRef()

    const handleExtract = async () => {
        if (!file) return
        setExtracting(true)
        setExtractError(null)
        try {
            const form = new FormData()
            form.append('file', file)
            const res = await fetch(`${BACKEND}/answer-keys/extract`, { method: 'POST', body: form })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || `Server error ${res.status}`)
            setQuestions(data.questions || [])
            if (data.error) setExtractError(data.error)
        } catch (err) {
            setExtractError(err.message)
            setQuestions([])
        } finally {
            setExtracting(false)
            setStep('edit')
        }
    }

    const handleSave = async () => {
        if (!title.trim() || !subject.trim()) {
            setSaveError('Title and Subject are required.')
            return
        }
        setSaving(true)
        setSaveError(null)
        try {
            const res = await fetch(`${BACKEND}/answer-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, subject, exam_title: examTitle, questions }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || `Server error ${res.status}`)
            onCreated(data)
        } catch (err) {
            setSaveError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold">New Answer Key</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {step === 'upload' ? 'Upload a PDF or DOCX marking scheme to extract questions automatically.' : 'Review and edit the extracted questions, then save.'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Step 1: Upload ── */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        <div
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-primary/40 rounded-xl p-10 text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-colors"
                        >
                            {file ? (
                                <div className="space-y-1">
                                    <FileText className="w-10 h-10 text-primary mx-auto" />
                                    <p className="font-semibold">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto" />
                                    <p className="font-medium">Drop your marking scheme here</p>
                                    <p className="text-xs text-muted-foreground">PDF or DOCX supported</p>
                                </div>
                            )}
                            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
                                onChange={e => setFile(e.target.files[0])} />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Gemini will extract questions, marks and step-wise criteria automatically. You can edit anything before saving.
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                            <Button className="flex-1 gap-2" onClick={handleExtract} disabled={!file || extracting}>
                                {extracting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {extracting ? 'Extracting…' : 'Extract with AI'}
                            </Button>
                        </div>

                        <button
                            onClick={() => setStep('edit')}
                            className="w-full text-xs text-muted-foreground hover:text-primary text-center transition-colors"
                        >
                            Skip extraction — enter questions manually →
                        </button>
                    </div>
                )}

                {/* ── Step 2: Edit ── */}
                {step === 'edit' && (
                    <div className="space-y-4">
                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Title *</label>
                                <input className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Physics Mid-Term — Class 10" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Subject *</label>
                                <input className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Physics" value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium">Exam Title (optional)</label>
                                <input className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                    placeholder="Unit Test 2 — February 2026" value={examTitle} onChange={e => setExamTitle(e.target.value)} />
                            </div>
                        </div>

                        {/* Extraction warning if any */}
                        {extractError && (
                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{extractError} — Questions added manually below will still be saved.</span>
                            </div>
                        )}

                        <QuestionEditor questions={questions} onChange={setQuestions} />

                        {saveError && (
                            <p className="text-sm text-destructive">{saveError}</p>
                        )}

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setStep('upload')}>← Back</Button>
                            <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? 'Saving…' : `Save Answer Key (${questions.length} Qs)`}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


// ── Answer Key Row ────────────────────────────────────────────────────────────
function AnswerKeyRow({ ak, onDelete }) {
    const [expanded, setExpanded] = useState(false)
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(false)

    const toggle = async () => {
        if (!expanded && !detail) {
            setLoading(true)
            try {
                const res = await fetch(`${BACKEND}/answer-keys/${ak.id}`)
                const data = await res.json()
                setDetail(data)
            } catch {
                // ignore
            } finally {
                setLoading(false)
            }
        }
        setExpanded(e => !e)
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-card transition-shadow hover:shadow-sm">
            {/* Summary row */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={toggle}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${SUBJECT_COLOR(ak.subject)}`}>
                        <Key className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">{ak.title}</h4>
                        <p className="text-xs text-muted-foreground">
                            {ak.subject} • {ak.questionCount} Questions • {ak.totalMarks} Marks • {new Date(ak.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline">{ak.subject}</Badge>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(ak.id) }}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                        title="Delete answer key"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {loading
                        ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        : expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                </div>
            </div>

            {/* Expanded question list */}
            {expanded && detail && (
                <div className="border-t bg-muted/20 p-4 space-y-2">
                    {detail.questions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">No questions in this key.</p>
                    )}
                    {detail.questions.map((q, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 min-w-0">
                                    <span className="text-xs font-bold text-muted-foreground mt-0.5 shrink-0">Q{q.q_number}</span>
                                    <p className="text-sm font-medium leading-snug">{q.text}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Badge variant="outline" className="text-[10px]">{q.type.replace('_', ' ')}</Badge>
                                    <span className="text-xs font-semibold text-primary">{q.max_marks} pts</span>
                                </div>
                            </div>
                            {q.steps?.length > 0 && (
                                <div className="ml-6 space-y-0.5">
                                    {q.steps.map((s, si) => (
                                        <div key={si} className="flex justify-between text-xs text-muted-foreground">
                                            <span><strong className="text-foreground">{s.step_key})</strong> {s.label}</span>
                                            <span className="shrink-0 ml-2">{s.max_marks} pts</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnswerKeys() {
    const [keys, setKeys] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showCreate, setShowCreate] = useState(false)
    const [offline, setOffline] = useState(false)

    const loadKeys = useCallback(() => {
        setLoading(true)
        fetch(`${BACKEND}/answer-keys`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => { setKeys(data); setOffline(false) })
            .catch(() => { setKeys([]); setOffline(true) })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { loadKeys() }, [loadKeys])

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this answer key? This cannot be undone.')) return
        try {
            await fetch(`${BACKEND}/answer-keys/${id}`, { method: 'DELETE' })
            setKeys(prev => prev.filter(k => k.id !== id))
        } catch {
            alert('Failed to delete. Is the backend running?')
        }
    }

    const filtered = keys.filter(k =>
        k.title.toLowerCase().includes(search.toLowerCase()) ||
        k.subject.toLowerCase().includes(search.toLowerCase())
    )

    const totalQuestions = keys.reduce((sum, k) => sum + k.questionCount, 0)
    const uniqueSubjects = new Set(keys.map(k => k.subject)).size

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {showCreate && (
                <CreateModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(newKey) => { setShowCreate(false); loadKeys() }}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Answer Keys</h2>
                    <p className="text-muted-foreground mt-1">Upload a marking scheme PDF/DOCX — AI extracts and structures it for you.</p>
                </div>
                <Button className="gap-2" onClick={() => setShowCreate(true)}>
                    <Plus className="w-4 h-4" /> New Answer Key
                </Button>
            </div>

            {/* Offline banner */}
            {offline && !loading && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-4 py-2.5 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Backend offline. Start it with <code className="font-mono bg-amber-100 px-1 rounded text-xs">uvicorn main:app --reload</code>
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: 'Total Keys', value: keys.length, icon: Key, color: 'bg-primary/10 text-primary' },
                    { label: 'Total Questions', value: totalQuestions, icon: FileText, color: 'bg-orange-100 text-orange-600' },
                    { label: 'Subjects Covered', value: uniqueSubjects, icon: Pencil, color: 'bg-green-100 text-green-600' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label}>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{label}</p>
                                {loading
                                    ? <div className="h-7 w-10 bg-muted animate-pulse rounded mt-0.5" />
                                    : <p className="text-2xl font-bold">{value}</p>
                                }
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search + List */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Search by title or subject…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading answer keys…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground space-y-2">
                        <Key className="w-12 h-12 mx-auto opacity-20" />
                        <p className="font-medium">{search ? 'No keys match your search.' : 'No answer keys yet.'}</p>
                        {!search && (
                            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)} className="mt-1">
                                <Plus className="w-4 h-4 mr-1" /> Create your first answer key
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(ak => (
                            <AnswerKeyRow key={ak.id} ak={ak} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
