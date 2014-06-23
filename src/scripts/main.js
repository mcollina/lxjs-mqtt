
function buildUpdater(key) {
  return function(value) {
    var elem = document.querySelector(key)
    value = parseFloat(value) * 100
    elem.innerText = Math.round(value) / 100
  }
}

bespoke.plugins.mqtt = function(deck) {
  var client = mqtt.createClient('ws://localhost:3000');
  var updateHumidity = buildUpdater('#humidity')
  var updateIrObject = buildUpdater('#ir-object')
  var updateIrAmbient = buildUpdater('#ir-ambient')

  client.subscribe('deck/next')
  client.subscribe('deck/prev')
  client.subscribe('sensortag/humidity')
  client.subscribe('sensortag/ir/+')

  client.on('message', function(topic, payload) {
    var command = topic.replace('deck/', '')
    if (deck[command])
      return deck[command]()

    if (topic == 'sensortag/humidity') {
      updateHumidity(payload)
    }

    if (topic == 'sensortag/ir/object') {
      updateIrObject(payload)
    }

    if (topic == 'sensortag/ir/ambient') {
      updateIrAmbient(payload)
    }
  });
};

bespoke.from('article', {
  mqtt: true,
  keys: true,
  touch: true,
  bullets: 'li, .bullet',
  scale: true,
  hash: true,
  progress: true,
  state: true,
  camera: { width: "320px" }
});

(function() {
  var form = document.querySelector('form.disabled')
  form.onsubmit = function() { return false }
})()
