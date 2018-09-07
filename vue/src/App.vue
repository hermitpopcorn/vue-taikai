<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import axios from 'axios'
import EventBus from '@/event-bus'

export default {
  name: 'App',
  data: function () {
    return {
      connection: null,
      mode: null,
      session: null
    }
  },
  mounted: function () {
    var self = this

    // set websocket connection
    EventBus.$on('set-websocket-connection', (connection) => {
      // assign to self
      self.connection = connection
      // attach events
      // handle connection error
      self.connection.onerror = (err) => {
        alert('Error pada koneksi WebSocket!')
        // close connection
        self.connection.close()
        // show blank page
        self.$router.push({ name: 'Blank' })

        throw err
      }
      // handle connection open
      self.connection.onopen = () => {
        console.log('Koneksi WebSocket terbuka.')
      }
      // handle connection message
      self.connection.onmessage = self.handleSocketMessage
      console.log('Berhasil terhubung dengan server websocket.')

      // emit confirmation message
      EventBus.$emit('confirm-websocket-connection')
    })

    // set mode
    EventBus.$on('set-mode', (mode) => {
      // assign to self
      self.mode = mode
      console.log(`Aplikasi diset menjadi mode ${mode}.`)

      // advance to session code input
      this.$router.push({ name: 'InputSession' })
    })

    // launch session from inputted session code
    EventBus.$on('session-launch', (sessionCode) => {
      axios.get(`/sessions/${sessionCode}`).then((response) => {
        // if session is underway, continue session
        if (typeof response.data.code !== 'undefined') {
          // assign to self
          self.session = response.data

          // report to websocket server
          self.connection.send(JSON.stringify({ type: 'sessionStart', code: self.session.code, mode: self.mode }))
          if (self.mode === 'server') {
            console.log(`Melanjutkan sesi ${self.session.code}.`)
            self.$router.push({ name: 'DisplayScreen' })
          } else if (self.mode === 'control') {
            // also request the websocket server to notify servers there's a new control guy around
            self.connection.send(JSON.stringify({ type: 'control', control: 'controllerAlert' }))
            console.log(`Kontrol terpasang pada sesi ${self.session.code}.`)
            self.$router.push({ name: 'ControlScreen' })
          }
        } else { // if session is unitialized, set it up
          self.$router.push({ name: 'SetupSession', params: { sessionCode: sessionCode } })
        }
      }).catch((error) => {
        console.log(error)
        alert('Gagal mengambil/membuat data sesi!')
      })
    })
    // create a new session
    EventBus.$on('session-create', (params) => {
      // create new session
      axios.post('/sessions', params).then((response) => {
        self.session = response.data
        self.connection.send(JSON.stringify({ type: 'sessionStart', code: self.session.code, mode: 'server' }))
        console.log('Sesi baru telah dimulai.')
        self.$router.push({ name: 'DisplayScreen' })
      }).catch((error) => {
        console.log(error)
        alert('Gagal membuat sesi baru!')
      })
    })
    // respond to session request
    EventBus.$on('request-session-data', () => {
      // emit response
      EventBus.$emit('say-session-data', self.session)
    })

    // point control
    EventBus.$on('control-point', (control) => {
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'point-' + control.type,
          team: control.team
        }
      }))
    })

    // round control
    EventBus.$on('control-round-set', (round) => {
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'round-set',
          round: round
        }
      }))
    })
  },
  methods: {
    // handle incoming websocket messages
    handleSocketMessage: function (message) {
      var self = this

      // parse JSON string
      message = JSON.parse(message.data)
      console.log(message) // for debug purposes

      // action messages
      if (typeof message.action !== 'undefined') {
        // add point
        if (message.action === 'point-add' && self.mode === 'server') {
          self.session.teams[message.team].points = parseInt(self.session.teams[message.team].points) + parseInt(self.session.pointIncrement)
          EventBus.$emit('say-session-data', self.session)
          self.updateSession()
        } else
        // subtract point
        if (message.action === 'point-subtract' && self.mode === 'server') {
          self.session.teams[message.team].points = parseInt(self.session.teams[message.team].points) - parseInt(self.session.pointIncrement)
          EventBus.$emit('say-session-data', self.session)
          self.updateSession()
        } else
        // set round
        if (message.action === 'round-set' && self.mode === 'server') {
          self.session.round = message.round
          if (typeof self.session.questionIndexes[message.round] === 'undefined') {
            self.session.questionIndexes[message.round] = null
          }
          EventBus.$emit('say-session-data', self.session)
          self.updateSession()
        } else
        // update session data
        if (message.action === 'sessionUpdate' && self.mode === 'control') {
          self.session = message.session
          EventBus.$emit('say-session-data', self.session)
        } else
        // eject user
        if (message.action === 'eject') {
          alert('Sesi tidak valid.')
          self.connection.close()
          self.$router.push({ name: 'Blank' })
        }
      }
    },

    // update session in db and broadcast it to other peers
    updateSession: function () {
      var self = this

      // save to db
      axios.put(`/sessions/${self.session.code}`, { session: self.session }).then((response) => {
        // broadcast
        self.connection.send(JSON.stringify({ type: 'sessionUpdate', session: self.session }))
        // happy log
        console.log('Sesi telah disimpan.')
      }).catch((error) => {
        console.log(error)
        // sad log
        alert('Gagal menyimpan data sesi!')
      })
    }
  }
}
</script>

<style>
body {
  background-image: url('/static/img/bg.svg')
}

html, body, #app {
  height: 100vh;
}
</style>
