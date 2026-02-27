import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import RequireAuth from '@/components/RequireAuth';
import HomePage from '@/pages/HomePage';
import TestsPage from '@/pages/TestsPage';
import TariffsPage from '@/pages/TariffsPage';
import BookPage from '@/pages/BookPage';
import DrivingPage from '@/pages/DrivingPage';
import GiftPage from '@/pages/GiftPage';
import SupportPage from '@/pages/SupportPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import TestAttemptPage from '@/pages/tests/TestAttemptPage';
import TestResultPage from '@/pages/tests/TestResultPage';
import MyAttemptsPage from '@/pages/tests/MyAttemptsPage';
import CategoryDetailPage from '@/pages/lessons/CategoryDetailPage';
import LessonDetailPage from '@/pages/lessons/LessonDetailPage';
import SchoolDashboardPage from '@/pages/school/SchoolDashboardPage';
import SchoolStudentsPage from '@/pages/school/SchoolStudentsPage';
import SchoolBalancePage from '@/pages/school/SchoolBalancePage';
import SchoolSettingsPage from '@/pages/school/SchoolSettingsPage';
import LessonsPage from '@/pages/LessonsPage';
import DemoPage from '@/pages/DemoPage';
import DemoTestPage from '@/pages/demo/DemoTestPage';
import DemoLessonPage from '@/pages/demo/DemoLessonPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Public pages
      { index: true, element: <HomePage /> },
      { path: 'tests', element: <TestsPage /> },
      { path: 'tariffs', element: <TariffsPage /> },
      { path: 'book', element: <BookPage /> },
      { path: 'driving', element: <DrivingPage /> },
      { path: 'gift', element: <GiftPage /> },
      { path: 'support', element: <SupportPage /> },
      { path: 'lessons', element: <LessonsPage /> },
      { path: 'categories/:slug', element: <CategoryDetailPage /> },
      { path: 'lessons/:slug', element: <LessonDetailPage /> },
      { path: 'demo', element: <DemoPage /> },
      { path: 'demo/test/:id', element: <DemoTestPage /> },
      { path: 'demo/lesson/:slug', element: <DemoLessonPage /> },

      // Auth required
      {
        element: <RequireAuth />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'tests/attempt/:id', element: <TestAttemptPage /> },
          { path: 'tests/result/:id', element: <TestResultPage /> },
          { path: 'tests/history', element: <MyAttemptsPage /> },
          { path: 'school', element: <SchoolDashboardPage /> },
          { path: 'school/students', element: <SchoolStudentsPage /> },
          { path: 'school/balance', element: <SchoolBalancePage /> },
          { path: 'school/settings', element: <SchoolSettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
]);
