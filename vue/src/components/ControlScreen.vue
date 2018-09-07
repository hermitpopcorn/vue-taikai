<template>
  <div class="container is-fluid">
    <div class="columns vertical">
      <div class="column">
        <div class="columns vertical">
          <div class="column">
            <round-display :round="round"/>
            <div class="card">
              <div class="card-content">
                <div class="content">
                  <h3>Set Ronde</h3>
                  <div class="columns">
                    <div class="column">
                      <button class="button is-primary is-fullwidth" v-on:click="setRound(0)">Lempar</button>
                    </div>
                    <div class="column">
                      <button class="button is-link is-fullwidth" v-on:click="setRound(1)">Salah-Betul</button>
                    </div>
                    <div class="column">
                      <button class="button is-success is-fullwidth" v-on:click="setRound(2)">Tebak Lagu</button>
                    </div>
                    <div class="column">
                      <button class="button is-danger is-fullwidth" v-on:click="setRound(3)">Rebutan</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="column">
            <div class="card">
              <div class="card-content">
                <div class="content">
                  <h3>Kontrol Pertanyaan</h3>
                  <div class="columns vertical">
                    <div class="column">
                      # Display pertanyaan
                    </div>
                    <div class="column">
                      <div class="columns">
                        <div class="column">
                          <div class="button is-link is-fullwidth">&#9654; Play / &#10074;&#10074; Pause</div>
                        </div>
                        <div class="column">
                          <div class="button is-info is-fullwidth">Tampilkan Pilihan Jawaban</div>
                        </div>
                        <div class="column is-half">
                          <div class="button is-primary is-fullwidth">Next &raquo;</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <points-box :teams="teams" :showButtons="true"/>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '@/event-bus'
import PointsBox from '@/components/parts/PointsBox'
import RoundDisplay from '@/components/parts/RoundDisplay'

export default {
  name: 'ControlScreen',
  components: { PointsBox, RoundDisplay },
  data: function () {
    return {
      round: null,
      teams: []
    }
  },
  mounted: function () {
    var self = this

    // request session data
    EventBus.$on('say-session-data', (session) => {
      self.teams = session.teams
      self.round = session.round
    })
    EventBus.$emit('request-session-data')
  },
  methods: {
    setRound: function (round) {
      EventBus.$emit('control-round-set', round)
    }
  }
}
</script>

<style scoped>
.columns.vertical {
  display: flex;
  flex-direction: column;
}
</style>
