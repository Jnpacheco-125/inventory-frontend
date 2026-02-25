<template>
  <div class="container mt-4">
    <h1>🏭 Sistema de Controle de Estoque</h1>
    <p class="lead">Gerencie suas matérias-primas e otimize sua produção</p>

    <div class="row mt-5">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">📦 Matérias-Primas</h5>
            <p class="card-text">Cadastre e gerencie o estoque de matérias-primas</p>
            <router-link to="/raw-materials" class="btn btn-primary">Acessar</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">📋 Produtos</h5>
            <p class="card-text">Cadastre produtos e suas composições</p>
            <router-link to="/products" class="btn btn-primary">Acessar</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">🎯 Otimização</h5>
            <p class="card-text">Descubra os produtos mais lucrativos</p>
            <router-link to="/optimize" class="btn btn-primary">Acessar</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
};
</script>