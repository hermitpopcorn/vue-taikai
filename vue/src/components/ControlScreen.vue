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
                      <template v-if="question">
                        <template v-if="!question.file">
                          <div class="columns">
                            <div class="column">
                              <strong>{{ question.question }}</strong>
                            </div>
                          </div>
                          <div class="columns is-multiline">
                            <div class="column is-one-fourth">
                              <button class="button is-success is-large is-fullwidth">{{ question.correctAnswer }}</button>
                            </div>
                            <template v-for="(wrongAnswer, index) in question.wrongAnswers">
                              <div class="column is-one-fourth" v-bind:key="index">
                                <button class="button is-large is-fullwidth">{{ wrongAnswer }}</button>
                              </div>
                            </template>
                          </div>
                        </template>
                        <template v-if="question.file">
                          Now playing: {{ question.correctAnswer }}
                        </template>
                      </template>
                      <template v-else>
                        Tidak ada pertanyaan aktif.
                      </template>
                    </div>
                    <div class="column">
                      <div class="columns">
                        <div class="column">
                          <div class="button is-primary is-fullwidth" v-on:click="prevQuestion()">&laquo; Prev</div>
                        </div>
                        <template v-if="question">
                          <template v-if="question.file">
                            <div class="column">
                              <div class="button is-link is-fullwidth" v-on:click="playSound()">&#9654; Play</div>
                            </div>
                            <div class="column">
                              <div class="button is-link is-fullwidth" v-on:click="pauseSound()">&#10074;&#10074; Pause</div>
                            </div>
                          </template>
                          <template v-else>
                            <div class="column">
                              <div class="button is-link is-fullwidth" v-on:click="showQuestion()">Tampilkan Soal</div>
                            </div>
                            <div class="column">
                              <div class="button is-link is-fullwidth" v-on:click="showOptions()">Tampilkan Pilihan Jawaban</div>
                            </div>
                          </template>
                        </template>
                        <div class="column">
                          <div class="button is-primary is-fullwidth" v-on:click="nextQuestion()">Next &raquo;</div>
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
      teams: [],
      question: null
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

    // on event: get question
    EventBus.$on('say-question', (question) => {
      self.question = question
    })
    EventBus.$emit('request2server-question-data')
  },
  methods: {
    setRound: function (round) {
      EventBus.$emit('control-round-set', round)
    },
    nextQuestion: function () {
      EventBus.$emit('question-pull')
    },
    prevQuestion: function () {
      EventBus.$emit('question-stepback')
    },
    playPauseSound: function () {
      EventBus.$emit('question-playpause')
    },
    playSound: function () {
      EventBus.$emit('question-play')
    },
    pauseSound: function () {
      EventBus.$emit('question-pause')
    },
    showQuestion: function () {
      EventBus.$emit('question-show-question')
    },
    showOptions: function () {
      EventBus.$emit('question-show-options')
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
