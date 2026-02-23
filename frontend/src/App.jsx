import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import GradingWorkspace from '@/pages/GradingWorkspace'
import GradingReview from '@/pages/GradingReview'
import AnswerKeys from '@/pages/AnswerKeys'
import QuestionPapers from '@/pages/QuestionPapers'
import Settings from '@/pages/Settings'
import Pricing from '@/pages/Pricing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/grading" element={<GradingWorkspace />} />
          <Route path="/grading/:id" element={<GradingReview />} />
          <Route path="/answer-keys" element={<AnswerKeys />} />
          <Route path="/question-papers" element={<QuestionPapers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
