<script lang="ts">
  import { auth } from '$lib/stores/auth.store';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  async function submit() {
    loading = true; error = '';
    try {
      await auth.login(email, password);
      location.href = '/';
    } catch (e: any) {
      error = e?.message ?? 'Error de autenticación';
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-sm mx-auto mt-16 rounded-2xl border bg-white p-6 shadow">
  <h1 class="text-lg font-semibold mb-4">Ingresar</h1>
  {#if error}<p class="text-sm text-red-600 mb-2">{error}</p>{/if}
  <form on:submit|preventDefault={submit} class="space-y-3">
    <input class="w-full rounded-lg border px-3 py-2" type="email" placeholder="Email" bind:value={email} required />
    <input class="w-full rounded-lg border px-3 py-2" type="password" placeholder="Contraseña" bind:value={password} required />
    <button class="btn-primary w-full" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
  </form>
</div>
