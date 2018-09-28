<template>
  <div class="card">
    <div class="card-content">
      <div class="content has-text-centered">
        <template v-if="round === null">
          <h1>Taikai</h1>
        </template>
        <template v-else>
          <h1 v-if="round === 0">Babak Lempar</h1>
          <h1 v-if="round === 1">Babak Salah-Betul</h1>
          <h1 v-if="round === 2">Babak Tebak Lagu</h1>
          <h1 v-if="round === 3">Babak Rebutan</h1>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RoundDisplay',
  props: {
    round: {
      type: Number
    }
  }
}
</script>

<style scoped>
h1 {
  text-transform: uppercase;
}
</style>
