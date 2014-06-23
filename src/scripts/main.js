
function buildUpdater(key) {
  return function(value) {
    var elem = document.querySelector(key)
    value = parseFloat(value) * 100
    elem.innerText = Math.round(value) / 100
  }
}

// hack MQTT to set the right URL
mqtt.createClientBase = mqtt.createClient;
mqtt.createClient = function(opts) {
  return this.createClientBase("ws://localhost:3000", opts);
};

bespoke.plugins.mqtt = function(deck) {
  var client = mqtt.createClient('ws://localhost:3000');
  var updateHumidity = buildUpdater('#humidity')
  var updateIrObject = buildUpdater('#ir-object')
  var updateIrAmbient = buildUpdater('#ir-ambient')

  client.subscribe('deck/next')
  client.subscribe('deck/prev')
  client.subscribe('sensortag/ir/+')

  client.on('message', function(topic, payload) {
    var command = topic.replace('deck/', '')
    if (deck[command])
      return deck[command]()

    if (topic == 'sensortag/ir/object') {
      updateIrObject(payload)
    }

    if (topic == 'sensortag/ir/ambient') {
      updateIrAmbient(payload)
    }
  })

  ;(function () {
    var elem = document.querySelector('#lcd')
    elem.onchange = function() {
      client.publish('yun/lcd', elem.value)
    }
  })()
};

bespoke.from('article', {
  mqtt: true,
  keys: true,
  touch: true,
  run: true,
  camera: { width: "320px" },
  bullets: 'li, .bullet',
  scale: true,
  hash: true,
  progress: true,
  state: true
});

(function() {
  var form = document.querySelector('form.disabled')
  form.onsubmit = function() { return false }
})()
