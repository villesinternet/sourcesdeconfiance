export function asset(name) {
  return browser.runtime.getURL(`/assets/${name}`);
}

export function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s[0].toUpperCase() + s.slice(1);
}
