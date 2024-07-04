<script lang="ts">
  import { page } from "$app/stores";
  import Modal from "@comps/Modal.svelte";
  import Toast from "@comps/Toast.svelte";
  import XlsxErrorModal from "@comps/XlsxErrorModal.svelte";
  import { showModal } from "@comps/modal";
  import type { ChangeEventHandler } from "svelte/elements";
  import Moon from "~icons/lucide/moon";
  import Sun from "~icons/lucide/sun";
  import "../app.css";
  import { theme } from "./theme";
  import { onMount } from "svelte";
  import { PUBLIC_MAINTAINCE } from "$env/static/public";

  let links = [
    { link: "/dashboard", icon: "sd", label: "Dashboard" },
    { link: "/leads", icon: "sd", label: "Leads" },
  ];

  let plinks = [...links];

  onMount(() => {
    if (data.role === "ADMIN") {
      plinks.push({ link: "/sign-up", icon: "md", label: "Add User" });
      plinks.push({ link: "/users", icon: "md", label: "Users" });
      plinks = [...plinks];
    } else plinks = [...links];
  });

  const onThemeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const setTheme = (_theme: "forest" | "cupcake") => {
      theme.set(_theme);
      document.documentElement.setAttribute("data-theme", _theme);
      localStorage.setItem("data-theme", _theme);
    };
    if (e.currentTarget.checked) {
      setTheme("forest");
    } else {
      setTheme("cupcake");
    }
  };

  export let data;

  $: if ($page.form && $page.form.type === "Logic") {
    showModal("errorModal");
  }
</script>

<Modal on:close={(e) => e.detail()} key="errorModal">
  <div slot="title">Error Occured in the operation!</div>
  {#if $page.form && $page.form.type === "Logic"}
    <div class="flex flex-col max-w-md w-full gap-4">
      <div class="card bg-base-200">
        <div class="card-body">
          <div class="card-title text-3xl">{$page.form.type}</div>
          <div>{$page.form.error}</div>
        </div>
      </div>
    </div>
  {/if}
</Modal>

<Toast />

{#if PUBLIC_MAINTAINCE === "on"}
  <slot />
{:else}
  <div class="drawer lg:drawer-open">
    <input id="mainDrawer" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content">
      <slot />
    </div>
    <div class="drawer-side">
      <label for="my-drawer" class="drawer-overlay" />

      <ul class="flex flex-col p-4 min-h-full justify-between">
        <ul class="menu w-48 bg-base-100 text-base-content">
          {#if data.username}
            <div class="flex flex-col mb-5 items-center">
              <div class="badge bg-base-200 text-base-content badge-sm mb-3">
                {data.username}
              </div>
              <a href="/logout" class="btn btn-xs btn-secondary"> Logout </a>
            </div>
          {/if}
          {#each plinks as { link, label }}
            <li>
              <a
                class:active={$page.url.pathname.startsWith(link) &&
                  link !== "/"}
                href={link}>{label}</a>
            </li>
          {/each}
        </ul>
        <label class="swap swap-rotate">
          <input
            on:change={onThemeChange}
            type="checkbox"
            checked={data.theme === "cupcake" ? false : true} />
          <!-- sun icon -->
          <Sun class="text-base-content text-lg swap-off" />
          <!-- moon icon -->
          <Moon class="text-base-content text-lg swap-on" />
        </label>
      </ul>
    </div>
  </div>
{/if}

<XlsxErrorModal />
