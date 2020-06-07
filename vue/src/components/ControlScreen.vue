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
                              <h3>
                                [ Kategori: {{ question.category }} ]
                                <template v-if="question.showOptions">
                                  [ Soal Pilihan Ganda ]
                                </template>
                              </h3>
                              <h2><strong v-html="question.question"></strong></h2>
                            </div>
                          </div>
                          <template v-if="question.options">
                            <div class="columns is-multiline">
                              <template v-for="(option, index) in question.options">
                                <div class="column is-one-fourth" v-bind:key="index">
                                  <button class="button is-large is-fullwidth" :class="{ 'is-success': index === question.correctAnswer }">
                                    {{ ['A', 'B', 'C', 'D'][index] }}. <span v-html="option"></span>
                                  </button>
                                </div>
                              </template>
                            </div>
                          </template>
                          <template v-if="typeof question.correctAnswer === 'boolean'">
                            <div class="columns">
                              <div class="column">
                                <button class="button is-large is-fullwidth is-success" v-if="question.correctAnswer === true">Jawaban: O (Benar)</button>
                                <button class="button is-large is-fullwidth is-danger" v-if="question.correctAnswer === false">Jawaban: X (Salah)</button>
                              </div>
                            </div>
                          </template>
                          <div class="columns">
                            <template v-if="question.showQuestion">
                              <div class="column is-narrow">
                                Untuk soal ini, tampilkan <b>pertanyaan</b> di layar.
                              </div>
                            </template>
                            <template v-if="question.showOptions">
                              <div class="column is-narrow">
                                Untuk soal ini, tampilkan <b>pilihan jawaban</b> di layar.
                              </div>
                            </template>
                          </div>
                          <template v-if="question.note">
                            <div class="columns">
                              <div class="column">
                                <span v-html="question.note"></span>
                              </div>
                            </div>
                          </template>
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
                            <template v-if="question.options">
                              <div class="column">
                                <div class="button is-link is-fullwidth" v-on:click="showOptions()">Tampilkan Pilihan Jawaban</div>
                              </div>
                            </template>
                          </template>
                        </template>
                        <div class="column">
                          <div class="button is-primary is-fullwidth" v-on:click="nextQuestion()">Next &raquo;</div>
                        </div>
                      </div>
                    </div>
                    <div class="column">
                      <div class="button is-link is-fullwidth" v-on:click="ding()">Keluarkan Suara Aba-Aba</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <points-box :teams="teams" :showButtons="true" :reverseTeams="true" />
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

    // keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Space button = pause sound
      if (e.keyCode === 32) {
        e.preventDefault()
        self.pauseSound()
      } else
      // P = ding
      if (e.keyCode === 80) {
        e.preventDefault()
        self.ding()
      } else
      // Left arrow = prev
      if (e.keyCode === 37) {
        e.preventDefault()
        self.prevQuestion()
      } else
      // Right arrow = next
      if (e.keyCode === 39) {
        e.preventDefault()
        self.nextQuestion()
      } else
      // L = show options
      if (e.keyCode === 76) {
        e.preventDefault()
        self.showOptions()
      } else
      // J = show question
      if (e.keyCode === 74) {
        e.preventDefault()
        self.showQuestion()
      }
    })
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
    },
    ding: function () {
      EventBus.$emit('ding')
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
