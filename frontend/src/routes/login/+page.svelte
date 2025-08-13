<script lang="ts">
  import { form, error, loading, submit } from './logic';
  import { onDestroy } from 'svelte';

  type FormState = { email: string; password: string };
  let formData: FormState = { email: '', password: '' };
  let err: string | null = null;
  let isLoading = false;

  const unsubForm = form.subscribe((v) => (formData = v));
  const unsubErr = error.subscribe((v) => (err = v));
  const unsubLoading = loading.subscribe((v) => (isLoading = v));
  onDestroy(() => { unsubForm(); unsubErr(); unsubLoading(); });

  function onEmailInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    form.update((s) => ({ ...s, email: value }));
  }

  function onPasswordInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    form.update((s) => ({ ...s, password: value }));
  }
</script>

<div class="max-w-sm mx-auto mt-16 rounded-2xl border bg-white p-6 shadow">
  <h1 class="text-lg font-semibold mb-4">Ingresar</h1>

  {#if err}
    <p class="text-sm text-red-600 mb-2">{err}</p>
  {/if}

  <form on:submit|preventDefault={submit} class="space-y-3">
    <input
      class="w-full rounded-lg border px-3 py-2"
      type="email"
      placeholder="Email"
      value={formData.email}
      on:input={onEmailInput}
      required
    />
    <input
      class="w-full rounded-lg border px-3 py-2"
      type="password"
      placeholder="Contraseña"
      value={formData.password}
      on:input={onPasswordInput}
      required
    />
    <button
      class="btn-primary w-full"
      disabled={isLoading}
    >
      {isLoading ? 'Ingresando…' : 'Ingresar'}
    </button>
  </form>
</div>
