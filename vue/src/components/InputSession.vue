<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-centered">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                Input Kode Sesi
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                <p>Masukkan kode sesi:</p>
                <form v-on:submit.prevent="formSubmit">
                  <div class="field has-addons">
                    <div class="control is-expanded">
                      <input class="input" type="text" v-model="sessionCode" maxlength="3" autofocus>
                    </div>
                    <div class="control">
                      <a class="button is-primary" v-on:click="formSubmit">
                        Submit
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import EventBus from '@/event-bus'

export default {
  name: 'InputSession',
  data: function () {
    return {
      sessionCode: ''
    }
  },
  methods: {
    formSubmit: function () {
      var self = this

      EventBus.$emit('session-launch', self.sessionCode)
    }
  }
}
</script>
