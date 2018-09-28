<template>
  <div class="container is-fluid">
    <div class="columns" id="d_columns">
      <div class="column" id="d_column1">
        <round-display :round="round"/>
      </div>
      <div class="column" id="d_column2">
        <div class="columns" v-if="question">
          <div class="column">
            <div class="card">
              <div class="card-content">
                <div class="content">
                  <!-- Question -->
                  <template v-if="showQuestion">
                    <h1>{{ question.question }}</h1>
                  </template>
                  <template v-else>
                    <h1 class="has-text-centered">Simak pertanyaan baik-baik!</h1>
                  </template>
                  <!-- Options -->
                  <template v-if="showOptions">
                    <div class="columns is-multiline">
                      <template v-for="(option, index) in question.options">
                        <div class="column is-half" v-bind:key="index">
                          <button class="button is-large is-fullwidth">{{ option }}</button>
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
  </div>
</template>

<script>
import EventBus from '@/event-bus'
import PointsBox from '@/components/parts/PointsBox'
import RoundDisplay from '@/components/parts/RoundDisplay'

export default {
  name: 'DisplayScreen',
  components: { PointsBox, RoundDisplay },
  data: function () {
    return {
      round: null,
      teams: [],
      question: null,
      showQuestion: false,
      showOptions: false
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
      // shuffle answer options
      if (typeof question.correctAnswer !== 'undefined' && typeof question.wrongAnswers !== 'undefined') {
        let options = question.wrongAnswers.slice(0) // clone array
        options.push(question.correctAnswer)
        // randomize
        var currentIndex = options.length
        var temporaryValue
        var randomIndex
        // While there remain elements to shuffle...
        while (currentIndex !== 0) {
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex)
          currentIndex -= 1
          // And swap it with the current element.
          temporaryValue = options[currentIndex]
          options[currentIndex] = options[randomIndex]
          options[randomIndex] = temporaryValue
        }
        question.options = options
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
#d_column1 {
  flex-basis: 15%;
}
#d_column2 {
  flex-basis: 70%;
}
#d_column3 {
  flex-basis: 15%;
}

audio {
  width: 100%;
}
</style>
