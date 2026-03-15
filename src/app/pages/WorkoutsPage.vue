<template>
  <main class="p-4">
    <h1 class="text-2xl font-bold mb-4">Public Workouts</h1>
    <div class="mb-4 flex items-center">
      <input v-model="q" type="text" placeholder="Search workouts..." class="border p-2 mr-2 w-64" @keyup.enter="handleSearch" />
      <select v-model="provider" class="border p-2 mr-2">
        <option value="">All Providers</option>
        <option value="UniSport">UniSport</option>
        <option value="Campus Active">Campus Active</option>
      </select>
      <label class="inline-flex items-center mr-4 cursor-pointer">
        <input type="checkbox" v-model="semantic" class="mr-2" />
        <span class="text-sm">Semantic Search (AI)</span>
      </label>
      <button @click="handleSearch" class="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="workout in results.items" :key="workout.id" class="border-b py-2">
        <router-link :to="{ name: 'workout-detail', params: { slug: workout.slug } }" class="text-blue-600 font-semibold">
          {{ workout.title }}
        </router-link>
        <p class="text-sm text-gray-600">{{ workout.provider }} - {{ workout.category }}</p>
        <p v-if="workout.excerpt" class="text-sm line-clamp-2">{{ workout.excerpt }}</p>
        <p v-if="workout.weekday" class="text-xs text-gray-500">{{ workout.weekday }} - {{ workout.timeLabel }}</p>
      </div>
      <div class="mt-4 text-sm text-gray-500">
        Page {{ results.page }} of {{ results.pages }} (Total: {{ results.total }})
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { buildWorkoutsBrowseUrl, type WorkoutsBrowseResponse } from "../api";

const route = useRoute();
const router = useRouter();

const q = ref((route.query.q as string) || "");
const provider = ref((route.query.provider as string) || "");
const semantic = ref(route.query.semantic === "true");
const loading = ref(false);
const error = ref<string | null>(null);
const results = ref<WorkoutsBrowseResponse>({ items: [], total: 0, page: 1, pageSize: 20, pages: 0 });

async function handleSearch() {
  loading.value = true;
  error.value = null;
  
  router.push({ 
    query: { 
      q: q.value, 
      provider: provider.value, 
      semantic: semantic.value ? "true" : undefined 
    } 
  });
  
  try {
    const params: any = { q: q.value, provider: provider.value };
    if (semantic.value) params.semantic = "true";
    
    const url = buildWorkoutsBrowseUrl(window.location.origin, params);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch workouts");
    results.value = await res.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(handleSearch);
</script>
