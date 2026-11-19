<script>
  // Navy -> red hero banner shared by the Asset pages (guideline "Secondary 30%" card).
  // titleHtml: WordPress title.rendered (may contain entities); title: plain text.
  let { eyebrow, title = '', titleHtml = '', meta, actions } = $props();
</script>

<div class="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#0E0347] via-[#150B52] to-[#BB080B] p-6 text-white">
  <div class="min-w-0">
    <p class="text-body-sm mb-1 font-bold tracking-[0.2em] text-white/70 uppercase">{eyebrow}</p>
    <h1 class="text-h3 mb-1 leading-tight font-extrabold tracking-tight break-words text-white">
      {#if titleHtml}{@html titleHtml}{:else}{title}{/if}
    </h1>
    {@render meta?.()}
  </div>
  {#if actions}
    <div class="flex flex-wrap items-center gap-3">{@render actions()}</div>
  {/if}
</div>
