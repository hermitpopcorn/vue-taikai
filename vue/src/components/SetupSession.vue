<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-centered">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                Setup Sesi Cerdas Cermat Baru
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                <form v-on:submit.prevent="formSubmit">
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Nama Tim</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <p class="control is-expanded">
                          <input class="input" type="text" placeholder="Nama Tim 1" v-model="team1">
                        </p>
                      </div>
                      <div class="field">
                        <p class="control is-expanded">
                          <input class="input" type="text" placeholder="Nama Tim 2" v-model="team2">
                        </p>
                      </div>
                      <div class="field">
                        <p class="control is-expanded">
                          <input class="input" type="text" placeholder="Nama Tim 3" v-model="team3">
                        </p>
                      </div>
                      <div class="field">
                        <p class="control is-expanded">
                          <input class="input" type="text" placeholder="Nama Tim 4" v-model="team4">
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Inkremen Poin</label>
                    </div>
                    <div class="field-body">
                      <div class="control">
                        <div class="select is-rounded">
                          <select v-model="pointIncrement">
                            <option value="1">1 poin</option>
                            <option value="10">10 poin</option>
                            <option value="100">100 poin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label"></label>
                    </div>
                    <div class="field-body">
                      <div class="control">
                        <button class="button is-link" type="submit">Submit</button>
                      </div>
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
  name: 'SetupSession',
  props: ['sessionCode'],
  data: function () {
    return {
      team1: '',
      team2: '',
      team3: '',
      team4: '',
      pointIncrement: 1
    }
  },
  methods: {
    formSubmit: function () {
      var self = this

      // store settings in "params" variable
      var params = {
        code: self.sessionCode,
        teamNames: [],
        pointIncrement: self.pointIncrement
      }

      if (self.team1.length > 0) { params.teamNames.push(self.team1) }
      if (self.team2.length > 0) { params.teamNames.push(self.team2) }
      if (self.team3.length > 0) { params.teamNames.push(self.team3) }
      if (self.team4.length > 0) { params.teamNames.push(self.team4) }

      // if there are no team names, get angry and cancel
      if (params.teamNames.length < 1) {
        alert('Harus ada tim yang bermain.')
        return false
      }

      EventBus.$emit('session-create', params)
    }
  }
}
</script>
