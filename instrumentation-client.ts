const navigationStartEvent = "terratora:navigation-start";

export function onRouterTransitionStart(url: string) {
  window.dispatchEvent(new CustomEvent(navigationStartEvent, { detail: { url } }));
}
