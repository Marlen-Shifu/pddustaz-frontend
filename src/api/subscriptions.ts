import { apiClient } from './client';
import type { SubscriptionPlan, UserSubscription, SubscriptionCheck } from '@/types';

export const subscriptionsApi = {
  getPlans() {
    return apiClient.get<SubscriptionPlan[]>('/subscriptions/plans/');
  },

  getPlan(slug: string) {
    return apiClient.get<SubscriptionPlan>(`/subscriptions/plans/${slug}/`);
  },

  getMy() {
    return apiClient.get<UserSubscription[]>('/subscriptions/my/');
  },

  check() {
    return apiClient.get<SubscriptionCheck>('/subscriptions/check/');
  },
};
