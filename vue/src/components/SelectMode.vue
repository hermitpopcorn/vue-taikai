<template>
  <section class="section">
    <div class="container">
      <div class="columns is-mobile has-text-centered">
        <div class="column is-half">
          <button class="button is-large is-fullwidth is-fullheight" @click="choose('server')">Server</button>
        </div>
        <div class="column is-half">
          <button class="button is-large is-fullwidth is-fullheight" @click="choose('control')">Control</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import EventBus from '@/event-bus'

export default {
  name: 'SelectMode',
  methods: {
    choose: function (mode) {
      if (mode !== 'server' && mode !== 'control') {
        return
      }

      // emit mode
      EventBus.$emit('set-mode', mode)
    }
  }
}
</script>

<style scoped>
.section, .container, .columns, .column, .is-fullheight {
  height: 100%;
}
</style>
