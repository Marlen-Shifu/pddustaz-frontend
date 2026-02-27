import { apiClient } from './client';
import type { Test, LessonListItem, LessonDetail, DemoTestDetail, CheckAnswerResponse } from '@/types';

export const demoApi = {
  getLessons() {
    return apiClient.get<LessonListItem[]>('/demo/lessons/');
  },

  getLesson(slug: string) {
    return apiClient.get<LessonDetail>(`/demo/lessons/${slug}/`);
  },

  getTests() {
    return apiClient.get<Test[]>('/demo/tests/');
  },

  getTest(id: number) {
    return apiClient.get<DemoTestDetail>(`/demo/tests/${id}/`);
  },

  checkAnswer(testId: number, data: { question_id: number; answer_id: number }) {
    return apiClient.post<CheckAnswerResponse>(`/demo/tests/${testId}/check_answer/`, data);
  },
};
