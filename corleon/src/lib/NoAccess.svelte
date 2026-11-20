<script>
  let { message, backHref, backLabel = 'Back' } = $props();
</script>

<div class="max-w-4xl rounded-2xl border border-[#DB000F]/30 bg-[#A10000]/10 p-6 text-[#DB000F] dark:bg-[#A10000]/30 dark:text-white">
  <p class="text-h6 font-bold">No access</p>
  <p class="text-body-sm mt-1">{message}</p>
  <a href={backHref} class="text-body-sm mt-3 inline-block font-bold underline">{backLabel}</a>
</div>
