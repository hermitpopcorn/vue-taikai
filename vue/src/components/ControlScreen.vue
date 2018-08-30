<template>
  <div class="container is-fluid">
    <div class="columns">
      <div class="column">
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

export default {
  name: 'ControlScreen',
  components: { PointsBox },
  data: function () {
    return {
      teams: []
    }
  },
  mounted: function () {
    var self = this
    EventBus.$on('say-session-data', (session) => {
      self.teams = session.teams
    })
    EventBus.$emit('request-session-data')
  }
}
</script>

<style scoped>
.columns {
  display: flex;
  flex-direction: column;
}
</style>
