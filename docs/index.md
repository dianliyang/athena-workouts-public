---
editLink: false
---
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

onMounted(() => {
  // Redirect root to /de/
  router.go('/de/')
})
</script>

# Redirecting to Deutsch...

<meta http-equiv="refresh" content="0; url=/de/">
