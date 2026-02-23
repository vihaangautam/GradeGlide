import React, { useState, useRef, useCallback, useEffect } from 'react'
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
    RotateCw,
    Sun,
    Pencil,
    MousePointer,
    Trash2,
    FileText,
    ChevronDown,
    AlertTriangle,
    RefreshCw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Question types for CBSE/ICSE
// SHORT_ANSWER: simple +/- marks, no steps
// LONG_ANSWER:  step-wise (content, diagram, etc.)
// NUMERICAL:    step-wise (formula, substitution, units, answer)
const Q_TYPE = { SHORT: 'SHORT_ANSWER', LONG: 'LONG_ANSWER', NUM: 'NUMERICAL' }

const MOCK_EXAM_DATA = {
    studentName: 'Rahul Sharma',
    rollNo: '12C-42',
    subject: 'Physics',
    totalMarks: 35,
    obtainedMarks: 28,
    status: 'In Progress',
    questions: [
        {
            id: 1,
            question: "Define Ohm's Law.",
            questionType: Q_TYPE.SHORT,
            maxMarks: 2,
            obtainedMarks: 2,
            aiRemark: 'Correct definition provided. V=IR clearly stated.',
            status: 'correct',
            confidence: 'high',
            bbox: { x: 2, y: 4, w: 96, h: 27 },
            transcript: "Ohm's Law states that the current through a conductor is directly proportional to the voltage across it, provided temperature remains constant. V = IR",
        },
        {
            id: 2,
            question: 'Explain the working of a transformer.',
            questionType: Q_TYPE.LONG,
            maxMarks: 5,
            obtainedMarks: null,
            aiRemark: 'Diagram misses label for secondary coil. Explanation contains OCR errors — please verify manually.',
            status: 'partial',
            confidence: 'low',
            bbox: { x: 2, y: 33, w: 96, h: 40 },
            transcript: 'The transformer core is unabeilling [sic] the large coils with the primary secondary side, the voltage and the coils are mvurrd [sic]. The secondary coils is is unchnowe [sic] way to the worms. [Diagram present — "Labels missing!" annotation visible]',
            // CBSE long-answer marking scheme: step-by-step
            steps: [
                { id: 'a', label: 'Principle of mutual induction stated', maxMarks: 1, obtainedMarks: 1, aiStatus: 'correct' },
                { id: 'b', label: 'Working explanation (step-up / step-down)', maxMarks: 1, obtainedMarks: 1, aiStatus: 'correct' },
                { id: 'c', label: 'Labelled diagram of transformer', maxMarks: 2, obtainedMarks: null, aiStatus: 'low_confidence', aiNote: 'Secondary coil label appears missing — verify' },
                { id: 'd', label: 'Formula: Vs/Vp = Ns/Np', maxMarks: 1, obtainedMarks: 0, aiStatus: 'incorrect', aiNote: 'Formula not written by student' },
            ],
        },
        {
            id: 3,
            question: 'Calculate the equivalent resistance (R1=4Ω, R2=6Ω in parallel).',
            questionType: Q_TYPE.NUM,
            maxMarks: 3,
            obtainedMarks: 0,
            aiRemark: 'Formula applied incorrectly. Student wrote R = V × I (struck through).',
            status: 'incorrect',
            confidence: 'high',
            bbox: { x: 2, y: 75, w: 96, h: 20 },
            transcript: 'R = V × I  [crossed out with ✗ — "Wrong Formula" annotation in red]',
            // CBSE numerical marking scheme
            steps: [
                { id: 'a', label: 'Correct formula: 1/R = 1/R1 + 1/R2', maxMarks: 1, obtainedMarks: 0, aiStatus: 'incorrect', aiNote: 'Student wrote R = V×I — wrong formula' },
                { id: 'b', label: 'Correct substitution of values', maxMarks: 1, obtainedMarks: 0, aiStatus: 'incorrect' },
                { id: 'c', label: 'Final answer with correct unit (Ω)', maxMarks: 1, obtainedMarks: 0, aiStatus: 'incorrect' },
            ],
        },
    ],
}

// ─── Real Answer Sheet Photo ─────────────────────────────────────────────────
// Actual photographed handwritten answer sheet (camera-quality, realistic)
function AnswerSheetPhoto() {
    return (
        <img
            src="/answer_sheet.png"
            alt="Student handwritten answer sheet — Physics Mid-Term"
            draggable={false}
            style={{ width: '100%', display: 'block', userSelect: 'none' }}
        />
    )
}

// ─── LEGACY SVG (kept for reference, not rendered) ───────────────────────────
function _MockAnswerSheetSVG_UNUSED() {
    return (
        <svg
            viewBox="0 0 500 750"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', display: 'block' }}
        >
            {/* Paper base with slight warm tint (photo effect) */}
            <rect width="500" height="750" fill="#faf7f0" />
            {/* Faint ruled lines */}
            {Array.from({ length: 28 }).map((_, i) => (
                <line key={i} x1="0" y1={30 + i * 26} x2="500" y2={30 + i * 26}
                    stroke="#ddd5c8" strokeWidth="0.5" />
            ))}
            {/* Left margin line */}
            <line x1="55" y1="0" x2="55" y2="750" stroke="#f0a0a0" strokeWidth="0.8" />
            {/* Vignette overlay for photo feel */}
            <radialGradient id="vign" cx="50%" cy="50%" r="70%">
                <stop offset="70%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
            </radialGradient>
            <rect width="500" height="750" fill="url(#vign)" />

            {/* ── Header ── */}
            <text x="250" y="22" textAnchor="middle" fontFamily="serif" fontSize="11"
                fill="#333" fontWeight="bold">
                Delhi Public School — Physics Mid-Term Examination
            </text>
            <text x="60" y="38" fontFamily="serif" fontSize="9" fill="#555">
                Name: Rahul Sharma &nbsp;&nbsp;&nbsp; Roll No: 12C-42 &nbsp;&nbsp;&nbsp; Date: 20-Feb-2026
            </text>
            <line x1="10" y1="43" x2="490" y2="43" stroke="#bbb" strokeWidth="0.8" />

            {/* ═══ Q1 ═══ */}
            <text x="60" y="62" fontFamily="Arial" fontSize="10.5" fill="#111" fontWeight="bold">
                Q1. Define Ohm's Law.
            </text>
            {/* Handwriting lines */}
            <text x="62" y="79" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a" letterSpacing="0.3">
                Ohm's law states that the current through a conductor
            </text>
            <text x="62" y="94" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a" letterSpacing="0.3">
                is directly proportional to the potential difference
            </text>
            <text x="62" y="109" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a" letterSpacing="0.3">
                accross its ends, temp. remaining constant.  V = IR
            </text>
            {/* Teacher green checkmark */}
            <text x="12" y="92" fontFamily="Arial" fontSize="16" fill="#16a34a">✓</text>
            {/* Teacher mark in red */}
            <text x="468" y="78" fontFamily="Arial" fontSize="10" fill="#dc2626" fontWeight="bold">2/2</text>

            {/* ═══ Q2 ═══ */}
            <text x="60" y="134" fontFamily="Arial" fontSize="10.5" fill="#111" fontWeight="bold">
                Q2. Explain the working of a transformer.
            </text>
            <text x="62" y="150" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a">
                A transformer is based on principal of mutual
            </text>
            <text x="62" y="165" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a">
                induction. It is used to step up or step down
            </text>
            <text x="62" y="180" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a">
                alternating current voltage using two coils.
            </text>
            {/* Transformer pencil sketch */}
            <g transform="translate(80, 195)">
                {/* Core */}
                <rect x="60" y="10" width="120" height="60" fill="none" stroke="#888" strokeWidth="1.2" />
                <rect x="75" y="10" width="90" height="60" fill="#f0f0f0" stroke="#aaa" strokeWidth="0.6" />
                {/* Primary coil loops — left side */}
                {[0, 1, 2, 3].map(i => (
                    <ellipse key={i} cx={60} cy={22 + i * 14} rx={14} ry={6}
                        fill="none" stroke="#555" strokeWidth="1" />
                ))}
                <text x="-2" y="80" fontFamily="Arial" fontSize="8" fill="#333">Primary</text>
                {/* Secondary coil loops — right side */}
                {[0, 1, 2, 3].map(i => (
                    <ellipse key={i} cx={180} cy={22 + i * 14} rx={14} ry={6}
                        fill="none" stroke="#555" strokeWidth="1" />
                ))}
                {/* Label MISSING deliberately — AI caught this */}
                {/* Arrow indicating output */}
                <line x1="196" y1="40" x2="215" y2="40" stroke="#888" strokeWidth="1" />
                <polygon points="215,37 215,43 221,40" fill="#888" />
                {/* Smudge effect */}
                <ellipse cx="150" cy="55" rx="30" ry="4" fill="#ccc" opacity="0.3" />
            </g>
            {/* Teacher partial mark */}
            <text x="462" y="148" fontFamily="Arial" fontSize="10" fill="#dc2626" fontWeight="bold">?/5</text>
            {/* Circled missing label note */}
            <ellipse cx="285" cy="258" rx="28" ry="10" fill="none" stroke="#dc2626"
                strokeWidth="1" strokeDasharray="3,2" />
            <text x="317" y="262" fontFamily="Arial" fontSize="7.5" fill="#dc2626">Label?</text>

            {/* ═══ Q3 ═══ */}
            <text x="60" y="290" fontFamily="Arial" fontSize="10.5" fill="#111" fontWeight="bold">
                Q3. Calculate equivalent resistance (R1=4Ω, R2=6Ω parallel).
            </text>
            <text x="62" y="307" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a">
                R = V × I
            </text>
            {/* Strikethrough on wrong formula */}
            <line x1="62" y1="303" x2="115" y2="303" stroke="#dc2626" strokeWidth="1.5" />
            <text x="62" y="322" fontFamily="Georgia" fontSize="9.5" fill="#1a3a8a">
                R = 12 × 2 = 24 Ω  ← incorrect
            </text>
            <text x="62" y="337" fontFamily="Georgia" fontSize="9" fill="#888">
                (student left rest blank)
            </text>
            {/* Teacher cross */}
            <text x="12" y="313" fontFamily="Arial" fontSize="14" fill="#dc2626">✗</text>
            <text x="465" y="307" fontFamily="Arial" fontSize="10" fill="#dc2626" fontWeight="bold">0/3</text>

            {/* Slight page crumple shadow at corner */}
            <path d="M470,700 Q490,720 500,750 L460,750 Z" fill="#e8e0d5" opacity="0.6" />
        </svg>
    )
}

// ─── Bounding Box Overlay ─────────────────────────────────────────────────────
const BOX_COLORS = {
    correct: { border: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    partial: { border: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    incorrect: { border: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
}

function BoundingBoxes({ questions, activeQ, onClickBox }) {
    return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
            {questions.map(q => {
                const c = BOX_COLORS[q.status]
                const isActive = activeQ === q.id
                return (
                    <div
                        key={q.id}
                        onClick={() => onClickBox(q.id)}
                        className="absolute rounded transition-all duration-300"
                        style={{
                            left: `${q.bbox.x}%`,
                            top: `${q.bbox.y}%`,
                            width: `${q.bbox.w}%`,
                            height: `${q.bbox.h}%`,
                            border: `2px solid ${c.border}`,
                            background: isActive ? c.bg.replace('0.08', '0.18') : c.bg,
                            boxShadow: isActive ? `0 0 0 3px ${c.border}55` : 'none',
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                        }}
                    >
                        {/* Q-number badge on box */}
                        <span
                            className="absolute -top-5 left-0 text-white text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: c.border }}
                        >
                            Q{q.id}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Red Pen Canvas Layer ─────────────────────────────────────────────────────
function RedPenCanvas({ active, onClear }) {
    const canvasRef = useRef(null)
    const drawing = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const clientY = e.touches ? e.touches[0].clientY : e.clientY
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height),
        }
    }

    const startDraw = useCallback((e) => {
        if (!active) return
        e.preventDefault()
        drawing.current = true
        const canvas = canvasRef.current
        lastPos.current = getPos(e, canvas)
    }, [active])

    const draw = useCallback((e) => {
        if (!drawing.current || !active) return
        e.preventDefault()
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const pos = getPos(e, canvas)
        ctx.beginPath()
        ctx.moveTo(lastPos.current.x, lastPos.current.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.strokeStyle = '#dc2626'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = 0.85
        ctx.stroke()
        lastPos.current = pos
    }, [active])

    const stopDraw = useCallback(() => { drawing.current = false }, [])

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    }, [])

    // expose clearCanvas via ref callback
    useEffect(() => {
        if (onClear) onClear.current = clearCanvas
    }, [clearCanvas, onClear])

    return (
        <canvas
            ref={canvasRef}
            width={1000}
            height={1500}
            className="absolute inset-0 w-full h-full"
            style={{
                zIndex: 3,
                cursor: active ? 'crosshair' : 'default',
                pointerEvents: active ? 'auto' : 'none',
                touchAction: 'none',
            }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
        />
    )
}

// ─── Step Mark Row (inside a stepped QuestionCard) ────────────────────────────
function StepRow({ step, onUpdate }) {
    const [mark, setMark] = useState(step.obtainedMarks ?? '')
    const isLowConf = step.aiStatus === 'low_confidence'

    const update = (val) => {
        const clamped = Math.max(0, Math.min(step.maxMarks, val))
        setMark(clamped)
        onUpdate(step.id, clamped)
    }

    const statusIcon = step.aiStatus === 'correct'
        ? <Check className="w-3 h-3 text-green-600" />
        : step.aiStatus === 'incorrect'
            ? <X className="w-3 h-3 text-red-500" />
            : <AlertTriangle className="w-3 h-3 text-amber-500" />

    return (
        <div
            className={cn(
                'flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs',
                isLowConf ? 'bg-amber-50 border border-amber-200' : 'bg-muted/30'
            )}
            onClick={e => e.stopPropagation()}
        >
            {/* Step label + AI status icon */}
            <div className="flex items-start gap-1.5 flex-1 min-w-0">
                <span className="mt-0.5 shrink-0">{statusIcon}</span>
                <div className="min-w-0">
                    <span className={cn('leading-tight', isLowConf ? 'text-amber-800' : 'text-foreground')}>
                        {step.label}
                    </span>
                    {step.aiNote && (
                        <p className="text-muted-foreground text-[10px] mt-0.5 leading-tight">{step.aiNote}</p>
                    )}
                </div>
            </div>

            {/* Mini mark control */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    className="w-5 h-5 rounded border text-xs font-bold flex items-center justify-center hover:bg-muted transition-colors"
                    onClick={() => update((mark === '' ? 0 : mark) - 0.5)}
                >−</button>

                {isLowConf ? (
                    <input
                        type="number" placeholder="?" value={mark}
                        min={0} max={step.maxMarks} step={0.5}
                        onChange={e => update(parseFloat(e.target.value) || 0)}
                        className="w-10 text-center text-xs font-bold border rounded py-0.5 bg-amber-50 border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-amber-400"
                    />
                ) : (
                    <span className="w-10 text-center font-bold">
                        {mark !== '' ? mark : '—'}
                    </span>
                )}

                <button
                    className="w-5 h-5 rounded border text-xs font-bold flex items-center justify-center hover:bg-muted transition-colors"
                    onClick={() => update((mark === '' ? 0 : mark) + 0.5)}
                >+</button>

                <span className="text-muted-foreground ml-0.5">/{step.maxMarks}</span>
            </div>
        </div>
    )
}

// ─── Question Card (Right Pane) ───────────────────────────────────────────────
function QuestionCard({ q, isActive, onSelect, onUpdateMark }) {
    const [showTranscript, setShowTranscript] = useState(false)
    const hasSteps = Array.isArray(q.steps) && q.steps.length > 0

    // For stepped questions: track step marks in local state
    const [stepMarks, setStepMarks] = useState(() =>
        hasSteps
            ? Object.fromEntries(q.steps.map(s => [s.id, s.obtainedMarks ?? '']))
            : {}
    )

    // Simple mark for non-stepped (SHORT_ANSWER) questions
    const [localMark, setLocalMark] = useState(q.obtainedMarks ?? '')
    const isLowConf = q.confidence === 'low'

    // Auto-total when step marks change
    const totalFromSteps = hasSteps
        ? Object.values(stepMarks).reduce((sum, v) => sum + (v === '' ? 0 : Number(v)), 0)
        : null

    const handleStepUpdate = (stepId, val) => {
        const updated = { ...stepMarks, [stepId]: val }
        setStepMarks(updated)
        const total = Object.values(updated).reduce((s, v) => s + (v === '' ? 0 : Number(v)), 0)
        onUpdateMark(q.id, total)
    }

    const handleMarkChange = (val) => {
        const clamped = Math.max(0, Math.min(q.maxMarks, val))
        setLocalMark(clamped)
        onUpdateMark(q.id, clamped)
    }

    const borderColor = isActive
        ? 'border-primary shadow-md shadow-primary/10'
        : q.status === 'correct'
            ? 'border-l-green-500'
            : q.status === 'partial'
                ? 'border-l-yellow-500'
                : 'border-l-red-500'

    // Q-type pill
    const typeLabel = {
        SHORT_ANSWER: { text: 'Short Answer', cls: 'bg-blue-50 text-blue-700' },
        LONG_ANSWER: { text: 'Long Answer', cls: 'bg-purple-50 text-purple-700' },
        NUMERICAL: { text: 'Numerical', cls: 'bg-orange-50 text-orange-700' },
    }[q.questionType] || { text: q.questionType, cls: 'bg-muted text-muted-foreground' }

    return (
        <Card
            className={cn(
                'mb-3 border-l-4 cursor-pointer transition-all',
                borderColor,
                isActive && 'ring-2 ring-primary/30'
            )}
            onClick={() => onSelect(q.id)}
        >
            <div className="p-4 space-y-3">
                {/* Q header */}
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', typeLabel.cls)}>
                                {typeLabel.text}
                            </span>
                        </div>
                        <h4 className="font-semibold text-sm leading-snug">Q{q.id}. {q.question}</h4>
                    </div>
                    <Badge variant="outline" className="shrink-0">{q.maxMarks} Marks</Badge>
                </div>

                {/* Low confidence warning (question-level) */}
                {isLowConf && !hasSteps && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                            <span className="font-semibold">Low Confidence:</span> Could not read
                            handwriting clearly. Please verify and enter marks yourself.
                        </p>
                    </div>
                )}

                {/* AI remark */}
                <div className="bg-muted/40 p-2.5 rounded-md">
                    <span className="font-semibold text-primary/80 flex items-center gap-1.5 mb-1 text-xs">
                        <MessageSquare className="w-3 h-3" /> AI Remark
                    </span>
                    <p className="text-xs text-muted-foreground">{q.aiRemark}</p>
                </div>

                {/* ── STEPPED marking (LONG_ANSWER / NUMERICAL) ── */}
                {hasSteps ? (
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1"
                        >Step-wise Marks</p>
                        {q.steps.map(step => (
                            <StepRow
                                key={step.id}
                                step={{ ...step, obtainedMarks: stepMarks[step.id] }}
                                onUpdate={handleStepUpdate}
                            />
                        ))}
                        {/* Auto-total */}
                        <div className="flex justify-between items-center px-1 pt-1 border-t mt-2">
                            <span className="text-xs text-muted-foreground">Total (auto-calculated)</span>
                            <span className="font-bold text-sm text-primary">
                                {totalFromSteps} / {q.maxMarks}
                            </span>
                        </div>
                    </div>
                ) : (
                    /* ── SIMPLE marking (SHORT_ANSWER) ── */
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm" variant="outline" className="h-8 w-8 p-0"
                                onClick={(e) => { e.stopPropagation(); handleMarkChange((localMark || 0) - 0.5) }}
                                disabled={isLowConf && localMark === ''}
                            >−</Button>

                            {isLowConf ? (
                                <input
                                    type="number" placeholder="?" value={localMark}
                                    min={0} max={q.maxMarks} step={0.5}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => handleMarkChange(parseFloat(e.target.value) || 0)}
                                    className={cn(
                                        'w-14 text-center font-bold text-lg border rounded-md py-1',
                                        'bg-amber-50 border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400',
                                        'placeholder:text-amber-400'
                                    )}
                                />
                            ) : (
                                <div className="w-14 text-center font-bold text-lg">{localMark}</div>
                            )}

                            <Button
                                size="sm" variant="outline" className="h-8 w-8 p-0"
                                onClick={(e) => { e.stopPropagation(); handleMarkChange((localMark || 0) + 0.5) }}
                            >+</Button>
                        </div>

                        <div className="flex gap-1">
                            <Button size="sm"
                                variant={q.status === 'correct' ? 'default' : 'ghost'}
                                className={q.status === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600'}
                                onClick={e => e.stopPropagation()}
                            ><Check className="w-4 h-4" /></Button>
                            <Button size="sm"
                                variant={q.status === 'incorrect' ? 'default' : 'ghost'}
                                className={q.status === 'incorrect' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600'}
                                onClick={e => e.stopPropagation()}
                            ><X className="w-4 h-4" /></Button>
                        </div>
                    </div>
                )}

                {/* View AI Transcript toggle */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowTranscript(s => !s) }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                    <FileText className="w-3 h-3" />
                    View AI Transcript
                    <ChevronDown className={cn('w-3 h-3 transition-transform', showTranscript && 'rotate-180')} />
                </button>

                {showTranscript && (
                    <div className="text-xs bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-600 italic leading-relaxed">
                        "{q.transcript}"
                    </div>
                )}
            </div>
        </Card>
    )
}


// ─── Main Component ───────────────────────────────────────────────────────────
const BACKEND_BASE = 'http://localhost:8000'

export default function GradingReview() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState(null)
    const [activeQ, setActiveQ] = useState(null)
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [brightness, setBrightness] = useState(false)
    const [redPen, setRedPen] = useState(false)
    const [activeTab, setActiveTab] = useState('ai')
    const imageContainerRef = useRef(null)
    const clearCanvasRef = useRef(null)
    const saveTimer = useRef(null)

    // ── Fetch session from backend; fall back to mock if backend is offline ──
    useEffect(() => {
        setLoading(true)
        fetch(`${BACKEND_BASE}/sessions/${id}`)
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(json => { setData(json); setApiError(null) })
            .catch(() => {
                // Backend offline → use built-in mock so UI still works
                setData(MOCK_EXAM_DATA)
                setApiError('Backend offline — showing demo data')
            })
            .finally(() => setLoading(false))
    }, [id])

    // ── Save mark updates to backend (debounced 600ms) ───────────────────────
    const handleUpdateMark = useCallback((qid, newMark, stepId = null) => {
        setData(prev => {
            if (!prev) return prev
            const updatedQuestions = prev.questions.map(q =>
                q.id === qid ? { ...q, obtainedMarks: newMark } : q
            )
            const newTotal = updatedQuestions.reduce((sum, q) => sum + (q.obtainedMarks ?? 0), 0)
            return { ...prev, questions: updatedQuestions, obtainedMarks: newTotal }
        })

        // Debounce the PATCH request
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
            fetch(`${BACKEND_BASE}/sessions/${id}/marks`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_id: String(qid),
                    step_id: stepId,
                    obtained_marks: newMark,
                }),
            }).catch(() => { }) // Silently ignore if backend offline
        }, 600)
    }, [id])

    // When a Q is selected from the right pane, highlight its bbox on the left
    const handleSelectQ = useCallback((qid) => {
        setActiveQ(prev => prev === qid ? null : qid)
        setTimeout(() => setActiveQ(null), 1800)
    }, [])

    // When bounding box is clicked on image
    const handleBoxClick = useCallback((qid) => {
        setActiveQ(qid)
        setTimeout(() => setActiveQ(null), 1800)
    }, [])

    const rotate = () => setRotation(r => (r + 90) % 360)
    const zoomIn = () => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))
    const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))
    const resetView = () => { setZoom(1); setRotation(0); setBrightness(false) }

    const imgFilter = [
        brightness ? 'brightness(1.35) contrast(1.2)' : '',
    ].filter(Boolean).join(' ') || 'none'

    // ── Loading state ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading grading session…</p>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <p className="text-destructive">Session not found.</p>
            </div>
        )
    }

    // Determine image source: backend URL > local static fallback
    const answerSheetSrc = data.answerSheetUrl
        ? `${BACKEND_BASE}${data.answerSheetUrl}`
        : '/answer_sheet.png'

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">

            {/* ── Top Bar ── */}
            < div className="flex items-center justify-between mb-4 pb-4 border-b shrink-0" >
                <div className="flex items-center gap-3">
                    <Link to="/grading">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{data.studentName}</h2>
                        <p className="text-sm text-muted-foreground">{data.subject} • {data.rollNo}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total Score</div>
                        <div className="text-2xl font-bold text-primary">
                            {data.obtainedMarks}{' '}
                            <span className="text-muted-foreground text-sm font-normal">/ {data.totalMarks}</span>
                        </div>
                    </div>
                    <Button size="lg" className="gap-2" onClick={() => {
                        fetch(`${BACKEND_BASE}/sessions/${id}/finalise`, { method: 'POST' }).catch(() => { })
                        setData(d => d ? { ...d, status: 'completed' } : d)
                    }}>
                        <Save className="w-4 h-4" /> Finalize Grade
                    </Button>
                </div>
            </div >

            {/* ── API offline banner ── */}
            {apiError && (
                <div className="mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-800 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {apiError} — start the backend with <code className="font-mono bg-amber-100 px-1 rounded">uvicorn main:app --reload</code> for real data.
                </div>
            )}

            {/* ── Split Screen ── */}
            < div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 overflow-hidden min-h-0" >

                {/* ════ LEFT PANE — Image Viewer ════ */}
                < div className="flex flex-col min-h-0 overflow-hidden rounded-lg border bg-slate-100" >

                    {/* Image Toolbar */}
                    < div className="flex items-center gap-1 px-3 py-2 border-b bg-white shrink-0 flex-wrap" >
                        {/* Zoom */}
                        < Button size="icon" variant="ghost" className="h-8 w-8" onClick={zoomOut}
                            title="Zoom Out" >
                            <ZoomOut className="w-4 h-4" />
                        </Button >
                        <span className="text-xs font-mono w-10 text-center text-muted-foreground">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={zoomIn}
                            title="Zoom In">
                            <ZoomIn className="w-4 h-4" />
                        </Button>

                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Rotate */}
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={rotate}
                            title="Rotate 90°">
                            <RotateCw className="w-4 h-4" />
                        </Button>

                        {/* Brightness */}
                        <Button size="icon" variant={brightness ? 'secondary' : 'ghost'}
                            className="h-8 w-8" onClick={() => setBrightness(b => !b)}
                            title="Brightness / Contrast Boost">
                            <Sun className="w-4 h-4" />
                        </Button>

                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Red Pen */}
                        <Button
                            size="sm"
                            variant={redPen ? 'default' : 'ghost'}
                            className={cn('h-8 gap-1.5 text-xs',
                                redPen ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-red-600 hover:bg-red-50')}
                            onClick={() => setRedPen(p => !p)}
                            title="Red Pen — draw on image"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            {redPen ? 'Drawing…' : 'Red Pen'}
                        </Button>

                        {
                            redPen && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground"
                                    onClick={() => clearCanvasRef.current?.()}
                                    title="Clear drawings">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )
                        }

                        {
                            !redPen && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground"
                                    title="Pan mode (default)">
                                    <MousePointer className="w-4 h-4" />
                                </Button>
                            )
                        }

                        <div className="ml-auto flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8"
                                title="Reset view" onClick={resetView}>
                                <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div >

                    {/* Image viewport — overflow + scroll for panning */}
                    < div
                        className="flex-1 overflow-auto bg-slate-200/60 flex items-start justify-center p-4 min-h-0"
                        style={{ cursor: redPen ? 'crosshair' : 'default' }
                        }
                    >
                        <div
                            ref={imageContainerRef}
                            className="relative shadow-xl rounded"
                            style={{
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                transformOrigin: 'top center',
                                width: `min(480px, 100%)`,
                                transition: 'transform 0.2s ease',
                                filter: imgFilter,
                            }}
                        >
                            {/* Answer sheet — real upload from backend or static fallback */}
                            <img
                                src={answerSheetSrc}
                                alt="Student answer sheet"
                                draggable={false}
                                style={{ width: '100%', display: 'block', userSelect: 'none' }}
                                onError={e => { e.target.src = '/answer_sheet.png' }}
                            />

                            {/* Bounding box overlays */}
                            <BoundingBoxes
                                questions={data.questions}
                                activeQ={activeQ}
                                onClickBox={handleBoxClick}
                            />

                            {/* Red pen canvas layer */}
                            <RedPenCanvas active={redPen} onClear={clearCanvasRef} />
                        </div>
                    </div >

                    {/* Page footer */}
                    < div className="bg-white border-t px-4 py-1.5 flex justify-between items-center text-xs text-muted-foreground shrink-0" >
                        <span>Page 1 of 3</span>
                        <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                    </div >
                </div >

                {/* ════ RIGHT PANE — Grading Panel ════ */}
                < div className="flex flex-col min-h-0 overflow-hidden" >
                    {/* Tab bar */}
                    < div className="bg-muted/30 border rounded-lg p-1 mb-3 flex gap-1 shrink-0" >
                        {
                            [
                                { key: 'ai', label: 'AI Suggestions' },
                                { key: 'rubric', label: 'Rubric' },
                                { key: 'key', label: 'Answer Key' },
                            ].map(tab => (
                                <Button
                                    key={tab.key}
                                    variant={activeTab === tab.key ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn('flex-1 text-xs',
                                        activeTab === tab.key
                                            ? 'shadow-sm bg-white text-primary'
                                            : 'text-muted-foreground'
                                    )}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </Button>
                            ))
                        }
                    </div >

                    {/* Instruction hint */}
                    < p className="text-[11px] text-muted-foreground mb-2 shrink-0" >
                        Click a question to highlight it on the answer sheet →
                    </p >

                    {/* Question cards */}
                    < div className="flex-1 overflow-y-auto pr-1 min-h-0" >
                        {
                            data.questions.map(q => (
                                <QuestionCard
                                    key={q.id}
                                    q={q}
                                    isActive={activeQ === q.id}
                                    onSelect={handleSelectQ}
                                    onUpdateMark={handleUpdateMark}
                                />
                            ))
                        }
                    </div >
                </div >

            </div >
        </div >
    )
}
