<template>
  <div class="container mt-4">
    <h1>🏭 Inventory Control System</h1>
    <p class="lead">Manage your raw materials and optimize your production</p>

    <div class="row mt-5">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">📦 Raw Materials</h5>
            <p class="card-text">Register and manage raw material stock</p>
            <router-link to="/raw-materials" class="btn btn-primary">Access</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">📋 Products</h5>
            <p class="card-text">Register products and their compositions</p>
            <router-link to="/products" class="btn btn-primary">Access</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">🎯 Optimization</h5>
            <p class="card-text">Discover the most profitable products</p>
            <router-link to="/optimize" class="btn btn-primary">Access</router-link>
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