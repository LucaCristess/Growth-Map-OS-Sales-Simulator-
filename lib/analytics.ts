'use client';

import posthog from 'posthog-js';

export const analytics = {
  // Session events
  sessionCreated: (sessionId: string, scanType: string) => {
    posthog.capture('session_created', { session_id: sessionId, scan_type: scanType });
  },

  sessionResumed: (sessionId: string, scanType: string, answeredCount: number) => {
    posthog.capture('session_resumed', { session_id: sessionId, scan_type: scanType, answered_count: answeredCount });
  },

  // Wizard events
  wizardStarted: (scanType: string) => {
    posthog.capture('wizard_started', { scan_type: scanType });
  },

  wizardQuestionAnswered: (questionKey: string, value: string | number | boolean | null, questionIndex: number) => {
    posthog.capture('wizard_question_answered', {
      question_key: questionKey,
      value_type: typeof value,
      is_unknown: value === null,
      question_index: questionIndex,
    });
  },

  wizardBackClicked: (questionKey: string, questionIndex: number) => {
    posthog.capture('wizard_back_clicked', { question_key: questionKey, question_index: questionIndex });
  },

  wizardCompleted: (scanType: string) => {
    posthog.capture('wizard_completed', { scan_type: scanType });
  },

  // Results events
  resultsViewed: (scanType: string, projectedRevenue: number) => {
    posthog.capture('results_viewed', { scan_type: scanType, projected_revenue: projectedRevenue });
  },

  unlockClicked: (scanType: string) => {
    posthog.capture('unlock_clicked', { scan_type: scanType });
  },

  // Lead capture events
  leadSubmitted: (scanType: string) => {
    posthog.capture('lead_submitted', { scan_type: scanType });
  },

  leadSubmissionFailed: (scanType: string, error: string) => {
    posthog.capture('lead_submission_failed', { scan_type: scanType, error });
  },

  // Report events
  reportViewed: (scanType: string, revenueCurrent: number, revenueExpected: number) => {
    posthog.capture('report_viewed', {
      scan_type: scanType,
      revenue_current: revenueCurrent,
      revenue_expected: revenueExpected,
      revenue_uplift: revenueExpected - revenueCurrent,
    });
  },

  // Page views
  pageViewed: (page: string) => {
    posthog.capture('$pageview', { $current_url: page });
  },
};
