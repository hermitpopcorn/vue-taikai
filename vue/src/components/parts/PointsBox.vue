<template>
  <div class="card" v-bind:class="{ 'large-text': useLargeText }">
    <div class="card-content">
      <div class="content">
        <nav class="level">
          <div class="level-item has-text-centered" v-for="(team, index) in teams" v-bind:key="index">
            <div>
              <p class="heading">{{ team.name }}</p>
              <p class="title">{{ team.points }}</p>
              <div class="columns" v-if="showButtons">
                <div class="column">
                  <button class="button is-success is-fullwidth" @click="pointAction('add', index)">+</button>
                </div>
                <div class="column">
                  <button class="button is-danger is-fullwidth" @click="pointAction('subtract', index)">-</button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '@/event-bus'

export default {
  name: 'PointsBox',
  props: {
    teams: {
      type: Array,
      default: () => { return [] }
    },
    showButtons: {
      type: Boolean,
      default: false
    },
    useLargeText: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    pointAction: function (type, teamIndex) {
      EventBus.$emit('control-point', { type: type, team: teamIndex })
    }
  }
}
</script>

<style scoped>
.large-text .level-item .heading {
  font-size: 2.5em;
  margin-bottom: 0;
}
.large-text .level-item .title {
  font-size: 6em;
  margin-bottom: 0;
}
</style>
