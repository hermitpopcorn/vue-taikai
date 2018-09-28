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
      session: null,
      question: null
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
            self.connection.send(JSON.stringify({ type: 'control', control: { action: null, message: 'controllerAlert' } }))
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
      if (self.mode === 'server') return false // not for servers
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
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'round-set',
          round: round
        }
      }))
    })

    // pull question
    EventBus.$on('question-pull', () => {
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'question-pull'
        }
      }))
    })
    // get previous question
    EventBus.$on('question-stepback', () => {
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'question-stepback'
        }
      }))
    })

    // respond to question request
    EventBus.$on('request2server-question-data', () => {
      if (self.mode === 'server') return false // not for servers
      // ask server to send it
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'broadcast-question'
        }
      }))
    })

    // play/pause sound
    EventBus.$on('question-playpause', () => {
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'question-playpause'
        }
      }))
    })
    EventBus.$on('question-play', () => {
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'question-play'
        }
      }))
    })
    EventBus.$on('question-pause', () => {
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'question-pause'
        }
      }))
    })
    // show question
    EventBus.$on('question-show-question', () => {
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'question-show-question'
        }
      }))
    })
    // show options
    EventBus.$on('question-show-options', () => {
      if (self.mode === 'server') return false // not for servers
      // send websocket message, targeting a server
      self.connection.send(JSON.stringify({
        type: 'control',
        control: {
          action: 'question-show-options'
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
      console.log('DEBUG', 'RECEIVED MESSAGE', message) // for debug purposes

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
        // pull next question
        if (message.action === 'question-pull' && self.mode === 'server') {
          let qIndex = self.session.questionIndexes[self.session.round]
          if (qIndex === null) { qIndex = 0 } else { qIndex = qIndex + 1 }
          self.getQuestion(qIndex)
        } else
        // pull previous question
        if (message.action === 'question-stepback' && self.mode === 'server') {
          let qIndex = self.session.questionIndexes[self.session.round]
          // only go to previous if a question is actually loaded and active,
          // and if not, just get the current index
          if (self.question !== null) {
            if (qIndex === null || qIndex === 0) {
              // do not go behind null
              console.log('Tidak dapat mengambil pertanyaan sebelumnya!') // log for server
              self.connection.send(JSON.stringify({ // message for peers
                type: 'message',
                message: 'Tidak dapat mengambil pertanyaan sebelumnya!'
              }))
              return false
            }
            qIndex = qIndex - 1
          }
          self.getQuestion(qIndex)
        } else
        // play/pause sound-based question
        if (message.action === 'question-playpause' && self.mode === 'server') {
          EventBus.$emit('question-playpause')
        } else
        if (message.action === 'question-play' && self.mode === 'server') {
          EventBus.$emit('question-play')
        } else
        if (message.action === 'question-pause' && self.mode === 'server') {
          EventBus.$emit('question-pause')
        } else
        // show question
        if (message.action === 'question-show-question' && self.mode === 'server') {
          EventBus.$emit('question-show-question')
        } else
        // show option
        if (message.action === 'question-show-options' && self.mode === 'server') {
          EventBus.$emit('question-show-options')
        } else
        // broadcast active question
        if (message.action === 'broadcast-question' && self.mode === 'server') {
          self.connection.send(JSON.stringify({
            type: 'serve',
            item: {
              serve: 'question',
              question: self.question
            }
          }))
        } else
        // update session data
        if (message.action === 'sessionUpdate' && self.mode === 'control') {
          self.session = message.session
          EventBus.$emit('say-session-data', self.session)
        } else
        // show message
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
      } else
      if (typeof message.serve !== 'undefined') {
        if (message.serve === 'question' && self.mode === 'control') {
          self.question = message.question
          console.log(self.question)
          EventBus.$emit('say-question', self.question)
        }
      } else {
        // when it's just literally a message
        alert(message)
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
    },

    getQuestion: function (index, stepback = false) {
      var self = this

      // fetch question from db
      axios.get(`/questions/${self.session.round}/${index}`).then((response) => {
        self.question = response.data
        console.log(self.question)
        EventBus.$emit('say-question', self.question)
        // NOTE comment this line below for testing
        self.session.questionIndexes[self.session.round] = index
        self.updateSession()
        self.connection.send(JSON.stringify({
          type: 'serve',
          item: {
            serve: 'question',
            question: self.question
          }
        }))
      }).catch((error) => {
        console.log('Tidak dapat mengambil pertanyaan selanjutnya!')
        console.log(error)
        self.connection.send(JSON.stringify({
          type: 'message',
          message: 'Tidak dapat mengambil pertanyaan selanjutnya!'
        }))
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
