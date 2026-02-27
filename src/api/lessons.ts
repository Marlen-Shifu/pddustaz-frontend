import { apiClient } from './client';
import type { Category, CategoryDetail, LessonListItem, LessonDetail } from '@/types';

export const lessonsApi = {
  getCategories() {
    return apiClient.get<Category[]>('/categories/');
  },

  getCategory(slug: string) {
    return apiClient.get<CategoryDetail>(`/categories/${slug}/`);
  },

  getLessons(categorySlug?: string) {
    const params = categorySlug ? { category: categorySlug } : undefined;
    return apiClient.get<LessonListItem[]>('/lessons/', { params });
  },

  getLesson(slug: string) {
    return apiClient.get<LessonDetail>(`/lessons/${slug}/`);
  },
};
