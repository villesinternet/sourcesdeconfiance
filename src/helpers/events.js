import Vue from 'vue';
var bus = new Vue();

export function send(event, payload) {
  console.log(`events@send: ${event}`);

  bus.$emit(event, payload);
}

export function listen(event, func) {
  console.log(`events@listen: ${event}`);

  bus.$on(event, func);
}
