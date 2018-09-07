<template>
  <div class="container is-fluid">
    <div class="columns" id="d_columns">
      <div class="column" id="d_column1">
        <round-display :round="round"/>
      </div>
      <div class="column" id="d_column2">
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
      teams: []
    }
  },
  mounted: function () {
    var self = this

    // get sessions
    EventBus.$on('say-session-data', (session) => {
      self.teams = session.teams
      self.round = session.round
    })
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
  flex-basis: 60%;
}
</style>
