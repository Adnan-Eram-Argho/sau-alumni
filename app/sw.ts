/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

type SerwistOptions = NonNullable<ConstructorParameters<typeof Serwist>[0]>;

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: NonNullable<SerwistOptions["precacheEntries"]>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.addEventListeners();