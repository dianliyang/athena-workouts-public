<template>
  <div class="max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 flex flex-col md:flex-row gap-16 lg:gap-24">
    <aside class="md:w-1/3 lg:w-1/4 shrink-0">
      <div class="sticky top-24">
        <h1 class="text-3xl font-medium text-slate-900 mb-12 tracking-tight">Workouts</h1>
        <div class="mb-12">
          <div class="relative flex items-center border-b border-slate-200 focus-within:border-slate-900 transition-colors mb-4">
            <input v-model="q" type="text" placeholder="Search activities..." class="w-full bg-transparent py-2 text-sm text-slate-900 focus:outline-none placeholder:text-slate-300" @keyup.enter="handleSearch" />
          </div>
          <label class="flex items-center cursor-pointer group">
            <input type="checkbox" v-model="semantic" class="mr-2 h-3 w-3 rounded border-slate-300 text-slate-900 focus:ring-slate-900" @change="handleSearch" />
            <span class="text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">Semantic AI</span>
          </label>
        </div>
        <nav class="flex flex-col gap-6 border-l border-slate-200 pl-6">
          <button v-for="cat in categories" :key="cat" @click="activeCategory = cat; handleSearch()" :class="[ 'text-left text-sm transition-all duration-300 relative', activeCategory === cat ? 'text-slate-900 font-medium' : 'text-slate-400 hover:text-slate-600' ]">
            <span v-if="activeCategory === cat" class="absolute -left-[1.65rem] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-900"></span>
            {{ cat }}
          </button>
        </nav>
      </div>
    </aside>
    <main class="md:w-2/3 lg:w-3/4">
      <header class="mb-16">
        <h2 class="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">Current Selection</h2>
        <h3 class="text-4xl md:text-5xl font-medium text-slate-900 leading-tight">{{ activeCategory === 'All' ? 'All Activities' : activeCategory }}</h3>
      </header>
      <div v-if="loading" class="py-12 text-slate-400 animate-pulse font-serif italic">Refining directory...</div>
      <div v-else-if="error" class="py-12 text-red-400 font-mono text-xs uppercase tracking-widest">{{ error }}</div>
      <div v-else class="space-y-12">
        <div v-for="(workout, index) in results.items" :key="workout.id" class="group py-8 border-t border-slate-200 flex flex-col sm:flex-row gap-6 sm:gap-12 transition-colors cursor-pointer" @click="$router.push({ name: 'workout-detail', params: { slug: workout.slug } })">
          <div class="sm:w-1/4 shrink-0">
            <span class="text-xs font-mono text-slate-400 block mb-2">{{ (index + 1).toString().padStart(2, '0') }}</span>
            <span class="inline-block px-2 py-1 bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-medium rounded-sm">{{ workout.category || "General" }}</span>
          </div>
          <div class="sm:w-3/4">
            <div class="flex flex-col xl:flex-row xl:items-baseline justify-between gap-2 mb-4">
              <h4 class="text-xl font-medium text-slate-900 group-hover:text-slate-500 transition-colors">{{ workout.title }}</h4>
              <span class="text-xs font-mono text-slate-400 uppercase tracking-tighter">{{ workout.weekday || "Anytime" }} — {{ workout.timeLabel || "Schedule" }}</span>
            </div>
            <p v-if="workout.excerpt" class="text-slate-600 leading-relaxed max-w-2xl font-serif italic">
              {{ workout.excerpt }}
            </p>
            <p class="mt-4 text-[10px] text-slate-300 uppercase tracking-widest font-medium">{{ workout.provider }} — {{ workout.location || "Various Locations" }}</p>
          </div>
        </div>
        <div v-if="results.items.length === 0" class="py-24 text-slate-400 font-serif italic text-center">No results match the current parameters.</div>
        <div v-if="results.pages > 1" class="mt-20 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest font-mono">
          <span>Page {{ results.page }} / {{ results.pages }}</span>
          <div class="flex gap-8">
            <button v-if="results.page > 1" @click="changePage(results.page - 1)" class="hover:text-slate-900 transition-colors">Previous</button>
            <button v-if="results.page < results.pages" @click="changePage(results.page + 1)" class="hover:text-slate-900 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { buildWorkoutsBrowseUrl, type WorkoutsBrowseResponse } from "../api";

const route = useRoute();
const router = useRouter();

const q = ref((route.query.q as string) || "");
const activeCategory = ref((route.query.category as string) || "All");
const semantic = ref(route.query.semantic === "true");
const loading = ref(false);
const error = ref<string | null>(null);
const results = ref<WorkoutsBrowseResponse>({ items: [], total: 0, page: 1, pageSize: 20, pages: 0 });

const categories = [ "All", "Fitness", "Yoga", "Pilates", "Dance", "Combat Sports", "Ball Sports", "Water Sports" ];

async function handleSearch(page = 1) {
  loading.value = true;
  error.value = null;
  
  router.push({ query: { q: q.value, category: activeCategory.value !== "All" ? activeCategory.value : undefined, semantic: semantic.value ? "true" : undefined, page: page > 1 ? page : undefined } });
  
  try {
    const params: any = { q: q.value, category: activeCategory.value !== "All" ? activeCategory.value : undefined, page, pageSize: 20 };
    if (semantic.value) params.semantic = "true";
    const url = buildWorkoutsBrowseUrl(window.location.origin, params);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Search request failed");
    results.value = await res.json();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function changePage(p: number) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  handleSearch(p);
}

onMounted(handleSearch);
</script>
