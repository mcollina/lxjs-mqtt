
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
  var votesUpdater = {
        red: buildUpdater('#votes-red')
      , yellow: buildUpdater('#votes-yellow')
      , green: buildUpdater('#votes-green')
    }

  var votes = {
        red: 0
      , yellow: 0
      , green: 0
    }

  var publishVotes = false

  client.subscribe('deck/next')
  client.subscribe('deck/prev')
  client.subscribe('votes')
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

    if (topic === 'votes') {
      votes[payload] += 1
      votesUpdater[payload](votes[payload])
    }

    if (publishVotes) {
      client.publish("yun/votes", votes.red * -2 + votes.yellow * 1 + votes.green * 2 + "")
    }
  })

  deck.on("activate", function(event) {
    ["red", "green", "yellow"].forEach(function(color) {
      votes[color] = 0
      votesUpdater[color](votes[color])
    })

    if (event.slide.id === 'votes') {
      publishVotes = true
    } else {
      publishVotes = false
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
