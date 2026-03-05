// --- Enums ---
export type UserRole = 'regular' | 'school_owner' | 'school_student';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type TestType = 'exam' | 'practice' | 'topic';
export type AttemptStatus = 'in_progress' | 'completed' | 'expired';
export type TransactionType = 'top_up' | 'purchase';

// --- Auth (JWT) ---
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  tokens: TokenResponse;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// --- Users ---
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: UserRole;
  driving_school: number | null;
  school_name: string | null;
  has_active_subscription: boolean;
  date_joined: string;
}

export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: File;
}

// --- Subscriptions ---
export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  duration_days: number;
  price_b2c: string;
  price_b2b: string;
  is_active: boolean;
  order: number;
}

export interface UserSubscription {
  id: number;
  user: number;
  plan: number;
  plan_name: string;
  status: SubscriptionStatus;
  is_active: boolean;
  price_paid: string;
  start_date: string;
  end_date: string;
  purchased_by_school: number | null;
  school_name: string | null;
  created_at: string;
}

export interface SubscriptionCheck {
  has_active_subscription: boolean;
  active_subscription: UserSubscription | null;
}

// --- Lessons ---
export interface Category {
  id: number;
  name: string;
  name_kz: string;
  slug: string;
  description: string;
  description_kz: string;
  order: number;
  lessons_count: number;
}

export interface CategoryDetail {
  id: number;
  name: string;
  name_kz: string;
  slug: string;
  description: string;
  description_kz: string;
  order: number;
  lessons: LessonListItem[];
}

export interface LessonListItem {
  id: number;
  title: string;
  title_kz: string;
  slug: string;
  image: string | null;
  order: number;
  is_demo: boolean;
}

export interface LessonDetail {
  id: number;
  title: string;
  title_kz: string;
  slug: string;
  content: string;
  content_kz: string;
  image: string | null;
  video_file: string | null;
  order: number;
  category: number;
  category_name: string;
  category_name_kz: string;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

// --- Tests ---
export interface Test {
  id: number;
  name: string;
  test_type: TestType;
  description: string;
  time_limit: number;
  passing_score: number;
  questions_count: number;
  is_demo: boolean;
}

export interface TestDetail extends Test {
  questions: Question[];
}

export interface TestAttempt {
  id: number;
  test: number;
  test_name: string;
  status: AttemptStatus;
  score: number;
  is_passed: boolean;
  started_at: string;
  finished_at: string | null;
}

export interface TestAttemptDetail {
  id: number;
  test: Test;
  status: AttemptStatus;
  score: number;
  is_passed: boolean;
  started_at: string;
  finished_at: string | null;
  answers: TestAnswer[];
}

export interface TestAnswer {
  id: number;
  question: number;
  selected_answer: number | null;
  is_correct: boolean;
}

export interface AnswerOption {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  image: string | null;
  answers: AnswerOption[];
}

export interface SubmitAnswerRequest {
  question_id: number;
  answer_id: number;
}

// --- Demo ---
export interface DemoAnswer {
  id: number;
  text: string;
  text_kz: string;
  order: number;
}

export interface DemoQuestion {
  id: number;
  text: string;
  text_kz: string;
  media: string | null;
  media_type: '' | 'image' | 'gif' | 'video';
  category: number;
  category_name: string;
  category_name_kz: string;
  answers: DemoAnswer[];
}

export interface DemoTestDetail extends Test {
  questions: DemoQuestion[];
}

export interface CheckAnswerResponse {
  is_correct: boolean;
  correct_answer_id: number | null;
  explanation: string;
  explanation_kz: string;
}

// --- Schools (B2B) ---
export interface DrivingSchoolListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  owner_name: string;
  students_count: number;
  is_active: boolean;
  created_at: string;
}

export interface DrivingSchoolDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  owner: number;
  owner_name: string;
  balance: string;
  max_students: number;
  students_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolUpdateRequest {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: File;
}

export interface Student {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'school_student';
  has_active_subscription: boolean;
  date_joined: string;
}

export interface StudentCreateRequest {
  username: string;
  email: string;
  phone?: string;
  password: string;
}

export interface BalanceResponse {
  balance: string;
  transactions: BalanceTransaction[];
}

export interface BalanceTransaction {
  id: number;
  transaction_type: TransactionType;
  amount: string;
  description: string;
  subscription: number | null;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
}

export interface PurchaseSubscriptionRequest {
  plan_id: number;
  student_ids: number[];
}

// --- Pagination ---
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
