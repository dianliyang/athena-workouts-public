<template>
  <div class="max-w-3xl mx-auto px-6 lg:px-8 py-20">
    <nav class="mb-20">
      <router-link to="/" class="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Directory
      </router-link>
    </nav>

    <div v-if="loading" class="py-24 text-slate-400 animate-pulse text-lg italic font-serif">Loading schedule...</div>
    <div v-else-if="error" class="py-24 text-red-400 font-mono text-sm uppercase tracking-tighter">System Error: {{ error }}</div>
    <article v-else-if="workout" class="animate-in fade-in duration-700">
      <header class="mb-16">
        <div class="text-slate-500 mb-6 flex gap-3 items-center text-sm uppercase tracking-widest">
          <span>{{ workout.provider }}</span>
          <span class="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
          <span class="font-mono text-xs">{{ workout.category }}</span>
        </div>
        
        <h1 class="text-4xl md:text-5xl font-medium text-slate-900 leading-tight mb-12 tracking-tight">
          {{ workout.title }}
        </h1>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 py-6 border-y border-slate-200">
          <div>
            <span class="block text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Location</span>
            <span class="text-sm font-medium text-slate-900">{{ workout.location || "Various" }}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Activity</span>
            <span class="text-sm font-medium text-slate-900">{{ workout.category || "Standard" }}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-1">Status</span>
            <span class="text-sm font-medium text-slate-900">Available</span>
          </div>
        </div>
      </header>

      <div class="space-y-16">
        <section v-if="workout.description">
          <h2 class="text-xs text-slate-400 uppercase tracking-[0.2em] mb-6">Overview</h2>
          <p class="text-xl text-slate-600 leading-relaxed font-serif italic">{{ workout.description }}</p>
        </section>

        <section v-if="workout.schedule && workout.schedule.length">
          <h2 class="text-xs text-slate-400 uppercase tracking-[0.2em] mb-6">Schedule</h2>
          <div class="grid grid-cols-1 gap-4">
            <div v-for="s in workout.schedule" :key="s" class="py-3 border-t border-slate-100 text-slate-900 font-medium font-mono text-sm">
              {{ s }}
            </div>
          </div>
        </section>

        <section class="pt-8 flex flex-wrap gap-4">
          <a v-if="workout.bookingUrl" :href="workout.bookingUrl" target="_blank" class="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 text-sm uppercase tracking-widest hover:bg-slate-700 transition-colors">
            Book Session
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
          </a>
          <a v-if="workout.url" :href="workout.url" target="_blank" class="inline-flex items-center gap-3 border border-slate-200 px-8 py-4 text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors text-slate-600">
            Original Info
          </a>
        </section>
      </div>
    </article>
  </div>
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
    if (!res.ok) throw new Error("Activity not found");
    workout.value = await res.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
