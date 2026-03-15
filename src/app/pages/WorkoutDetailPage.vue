<template>
  <main class="p-4">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="workout">
      <router-link to="/" class="text-blue-500 mb-4 inline-block">&larr; Back to search</router-link>
      <h1 class="text-3xl font-bold mb-2">{{ workout.title }}</h1>
      <p class="text-lg text-gray-700 mb-4">{{ workout.provider }} - {{ workout.category }}</p>
      
      <div v-if="workout.description" class="mb-6">
        <h2 class="text-xl font-semibold mb-2">Description</h2>
        <p class="whitespace-pre-wrap">{{ workout.description }}</p>
      </div>

      <div v-if="workout.schedule.length" class="mb-4">
        <h2 class="text-xl font-semibold mb-2">Schedule</h2>
        <ul class="list-disc ml-5">
          <li v-for="s in workout.schedule" :key="s">{{ s }}</li>
        </ul>
      </div>

      <div v-if="workout.location" class="mb-4 text-sm text-gray-600">
        <strong>Location:</strong> {{ workout.location }}
      </div>

      <div class="mt-6 flex space-x-4">
        <a v-if="workout.bookingUrl" :href="workout.bookingUrl" target="_blank" class="bg-green-600 text-white px-4 py-2 rounded">Book Now</a>
        <a v-if="workout.url" :href="workout.url" target="_blank" class="bg-blue-600 text-white px-4 py-2 rounded">View Original</a>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { buildWorkoutDetailUrl, type WorkoutDetailResponse } from "../api";

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const workout = ref<WorkoutDetailResponse | null>(null);

onMounted(async () => {
  try {
    const url = buildWorkoutDetailUrl(window.location.origin, route.params.slug as string);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Workout not found");
    workout.value = await res.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
