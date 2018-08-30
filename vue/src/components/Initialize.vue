<template>
  <section class="section">
    <div class="container is-fluid">
      <div class="columns is-centered">
        <div class="column is-narrow">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                Memulai aplikasi...
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                <p>API Server: {{ readiness.api ? 'OK' : 'NOT READY' }}</p>
                <p>WebSocket Server: {{ readiness.socket ? 'OK' : 'NOT READY' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import EventBus from '@/event-bus'

export default {
  name: 'Initialize',
  data: function () {
    return {
      readiness: {
        api: false,
        socket: false
      }
    }
  },
  mounted: function () {
    var self = this

    // get socket port
    axios.get('/port').then(function (response) {
      let socketPort = response.data.socketPort
      self.$set(self.readiness, 'api', true)
      console.log('Berhasil mengambil nomor port websocket.')

      // establish connection and send that connection via event bus
      let connection = new WebSocket(`ws://${window.location.hostname}:${socketPort}`)
      EventBus.$emit('set-websocket-connection', connection)
    }).catch((error) => {
      console.log(error)
      alert('Gagal mengambil nomor port socket!')
    })

    EventBus.$on('confirm-websocket-connection', function () {
      self.$set(self.readiness, 'socket', true)

      setTimeout(() => { self.$router.push({ name: 'SelectMode' }) }, 500)
    })
  }
}
</script>
