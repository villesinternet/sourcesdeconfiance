var services = [];

export function init() {
  browser.runtime.onMessage.addListener(fromBackground);
}

export function register(service, callback) {
  console.log('>register: ' + service);
  services[service] = {
    callback: callback,
  };
}

export function toBackground(service, payload) {
  console.log('>toBackground: service=' + service);

  return browser.runtime.sendMessage({
    service: service,
    payload: payload,
  });
}

function fromBackground(msg) {
  console.log('>comms:fromBackground service=' + msg.service);

  if (msg.service && msg.service in services) services[msg.service].callback(msg.payload);
}

// export function toPromisedBackground(service, payload) {
//   console.log('>toPromisedBackground: service=' + service);

//   return browser.runtime.sendMessage({
//     service: service,
//     payload: payload,
//   });
// }

// function fromPromisedBackground(msg) {
//   console.log('>comms:fromBackground service=' + msg.service);

//   if (msg.service && msg.service in services) services[msg.service].callback(msg.payload);
// }
