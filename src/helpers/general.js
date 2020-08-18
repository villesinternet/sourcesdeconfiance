export function asset(name) {
  return browser.runtime.getURL(`/assets/${name}`);
}
