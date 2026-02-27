import { apiClient } from './client';
import type { Test, TestDetail, TestAttempt, TestAttemptDetail, SubmitAnswerRequest } from '@/types';

export const testsApi = {
  getTests() {
    return apiClient.get<Test[]>('/tests/');
  },

  getTest(id: number) {
    return apiClient.get<TestDetail>(`/tests/${id}/`);
  },

  getAttempts() {
    return apiClient.get<TestAttempt[]>('/attempts/');
  },

  getAttempt(id: number) {
    return apiClient.get<TestAttemptDetail>(`/attempts/${id}/`);
  },

  startAttempt(testId: number) {
    return apiClient.post<TestAttempt>('/attempts/', { test: testId });
  },

  submitAnswer(attemptId: number, data: SubmitAnswerRequest) {
    return apiClient.post<{ is_correct: boolean }>(`/attempts/${attemptId}/submit_answer/`, data);
  },

  finishAttempt(attemptId: number) {
    return apiClient.post<TestAttemptDetail>(`/attempts/${attemptId}/finish/`);
  },
};
