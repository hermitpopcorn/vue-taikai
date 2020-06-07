<template>
  <div class="container is-fluid">
    <div class="columns" id="d_columns">
      <div class="column" id="d_column2">
        <div class="columns" v-if="question">
          <div class="column">
            <div class="card">
              <div class="card-content">
                <div class="content">
                  <!-- Question -->
                  <template v-if="showQuestion">
                    <h1 class="question" v-html="question.question"></h1>
                  </template>
                  <template v-else>
                    <h1 class="has-text-centered">Simak pertanyaan baik-baik!</h1>
                  </template>
                  <!-- Options -->
                  <template v-if="showOptions">
                    <div class="columns is-multiline">
                      <template v-for="(option, index) in question.options">
                        <div class="column is-half" v-bind:key="index">
                          <transition name="scale">
                            <button class="button is-large is-fullwidth option" v-show="showOptionFlag[index]"
                              :class="{ 'is-link': index === 0, 'is-success': index === 1, 'is-danger': index === 2, 'is-black': index === 3 }">
                              {{ ['A', 'B', 'C', 'D'][index] }}.&nbsp;&nbsp;<span v-html="option"></span>
                            </button>
                          </transition>
                        </div>
                      </template>
                    </div>
                  </template>
                  <!-- Audio Element -->
                  <audio controls v-if="question.file" ref="audioControl">
                    <source :src="'audio/' + question.file" type="audio/mp3"/>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="column" id="d_column3">
        <points-box :teams="teams" :useLargeText="true"/>
      </div>
    </div>
    <!-- Ding soound element -->
    <audio ref="dinger" style="display: none">
      <source src="static/audio/ding.mp3" type="audio/mp3"/>
      Your browser does not support the audio element.
    </audio>
  </div>
</template>

<script>
import EventBus from '@/event-bus'
import PointsBox from '@/components/parts/PointsBox'

export default {
  name: 'DisplayScreen',
  components: { PointsBox },
  data: function () {
    return {
      round: null,
      teams: [],
      question: null,
      showQuestion: false,
      showOptions: false,
      showOptionFlag: {
        0: false,
        1: false,
        2: false,
        3: false
      }
    }
  },
  mounted: function () {
    var self = this

    // on event: get sessions
    EventBus.$on('say-session-data', (session) => {
      self.teams = session.teams
      self.round = session.round
    })
    // on event: get question
    EventBus.$on('say-question', (question) => {
      console.log(question)
      // hide question & options by default
      self.showQuestion = false
      self.showOptions = false
      for (let i in self.showOptionFlag) {
        setTimeout(() => { self.$set(self.showOptionFlag, i, false) }, 10 * i)
      }
      self.question = question
      // load audio if audio question
      if (typeof self.$refs.audioControl !== 'undefined') {
        self.$refs.audioControl.load()
      }
    })
    // on event: play/pause audio
    EventBus.$on('question-playpause', () => {
      if (typeof self.$refs.audioControl === 'undefined') return false // not an audio question
      var audioControl = self.$refs.audioControl
      if (audioControl.paused) {
        audioControl.play()
      } else {
        audioControl.pause()
      }
    })
    // on event: play audio
    EventBus.$on('question-play', () => {
      if (typeof self.$refs.audioControl === 'undefined') return false // not an audio question
      var audioControl = self.$refs.audioControl
      audioControl.play()
    })
    // on event: pause audio
    EventBus.$on('question-pause', () => {
      if (typeof self.$refs.audioControl === 'undefined') return false // not an audio question
      var audioControl = self.$refs.audioControl
      audioControl.pause()
    })
    // on event: show question
    EventBus.$on('question-show-question', () => {
      self.showQuestion = true
    })
    // on event: show options
    EventBus.$on('question-show-options', () => {
      self.showOptions = true
      for (let i in self.showOptionFlag) {
        setTimeout(() => { self.$set(self.showOptionFlag, i, true) }, 1000 * i)
      }
    })
    // on event: play ding sound
    EventBus.$on('ding', () => {
      self.$refs.dinger.play()
    })
    // request session data
    EventBus.$emit('request-session-data')
  }
}
</script>

<style>
html, body {
  overflow: hidden;
}
</style>

<style scoped>
section.section, div.container, div.columns {
  height: 100%;
}

#d_columns {
  display: flex;
  flex-direction: column;
}
#d_column2 {
  flex-basis: 85%;
}
#d_column3 {
  flex-basis: 15%;
}

audio {
  width: 100%;
}

h1.question {
  font-size: 3em;
}

button.option {
  padding: 0;
  font-size: 3em;
  height: 100%;
  white-space: normal;
}

.scale-enter-active {
  -webkit-animation: scale-up-center 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
  animation: scale-up-center 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
}

/* ----------------------------------------------
 * Generated by Animista on 2018-9-30 17:28:24
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */

/**
 * ----------------------------------------
 * animation scale-up-center
 * ----------------------------------------
 */
@-webkit-keyframes scale-up-center {
0% {
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
}
100% {
  -webkit-transform: scale(1);
  transform: scale(1);
}
}
@keyframes scale-up-center {
0% {
  -webkit-transform: scale(0.5);
  transform: scale(0.5);
}
100% {
  -webkit-transform: scale(1);
  transform: scale(1);
}
}
</style>
