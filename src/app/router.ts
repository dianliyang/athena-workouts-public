import { createRouter, createWebHistory } from 'vue-router';
import WorkoutsPage from './pages/WorkoutsPage.vue';
import WorkoutDetailPage from './pages/WorkoutDetailPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'workouts', component: WorkoutsPage },
    { path: '/workouts/:slug', name: 'workout-detail', component: WorkoutDetailPage },
  ],
});
