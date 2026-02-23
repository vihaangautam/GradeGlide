/**
 * api.js — Centralised fetch wrapper for the GradeGlide FastAPI backend.
 * All requests go to http://localhost:8000
 */

const BASE = "http://localhost:8000"

async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, options)
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || `HTTP ${res.status}`)
    }
    return res.json()
}

// ── Sessions ──────────────────────────────────────────────────────────────

/** List all grading sessions for the batch list in GradingWorkspace */
export const getSessions = () => request("/sessions")

/** Full session data shaped for GradingReview */
export const getSession = (id) => request(`/sessions/${id}`)

/**
 * Save a mark update.
 * @param {string} sessionId
 * @param {string} questionId
 * @param {number|null} obtainedMarks
 * @param {string|null} stepId  — pass null for SHORT_ANSWER questions
 */
export const updateMarks = (sessionId, questionId, obtainedMarks, stepId = null) =>
    request(`/sessions/${sessionId}/marks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, step_id: stepId, obtained_marks: obtainedMarks }),
    })

/** Mark a session as completed */
export const finaliseSession = (sessionId) =>
    request(`/sessions/${sessionId}/finalise`, { method: "POST" })

// ── Upload ────────────────────────────────────────────────────────────────

/**
 * Upload an answer sheet file (PDF or image).
 * Returns { session_id, status: "processing" }
 */
export const uploadAnswerSheet = (file) => {
    const form = new FormData()
    form.append("answer_sheet", file)
    return request("/upload/session", { method: "POST", body: form })
}

// ── Export ────────────────────────────────────────────────────────────────

/** Download CSV export — triggers browser file download */
export const downloadCSV = (sessionId) => {
    window.open(`${BASE}/sessions/${sessionId}/export?format=csv`, "_blank")
}

/** Download JSON export */
export const downloadJSON = (sessionId) => {
    window.open(`${BASE}/sessions/${sessionId}/export?format=json`, "_blank")
}
