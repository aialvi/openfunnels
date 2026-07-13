import type { Funnel } from '@/types/editor';
import type { Exporter } from './index';
import { portableStyles, renderPortableFunnel } from './portable-markup';

export class VueExporter implements Exporter {
    export(funnel: Funnel): string {
        return `<template>
  <main class="of-page" :style="pageStyle">
    ${renderPortableFunnel(funnel, 'vue')}
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

const pageStyle = ${JSON.stringify({ fontFamily: funnel.settings.fontFamily || 'Inter, sans-serif', background: funnel.settings.backgroundColor })};
let countdownTimer: number | undefined;

function updateCountdowns() {
  document.querySelectorAll<HTMLElement>('[data-countdown]').forEach((element) => {
    const target = new Date(element.dataset.countdown || '').getTime();
    const remaining = Number.isFinite(target) ? Math.max(0, target - Date.now()) : 0;
    const values: Record<string, number> = { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, seconds: Math.floor(remaining / 1000) % 60 };
    element.querySelectorAll<HTMLElement>('[data-countdown-unit]').forEach((unit) => { const node = unit.querySelector('strong'); if (node) node.textContent = String(values[unit.dataset.countdownUnit || ''] || 0).padStart(2, '0'); });
  });
}

onMounted(() => { updateCountdowns(); countdownTimer = window.setInterval(updateCountdowns, 1000); });
onBeforeUnmount(() => { if (countdownTimer) window.clearInterval(countdownTimer); });
</script>

<style>${portableStyles}</style>`;
    }
}
