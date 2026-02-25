<template>
  <div class="container mt-4">
    <h2>🎯 Otimização de Produção</h2>
    
    <div class="row mb-4">
      <div class="col-md-4">
        <label class="form-label">Mostrar top</label>
        <select v-model="topN" class="form-select" @change="loadOptimization">
          <option value="3">3 produtos</option>
          <option value="5">5 produtos</option>
          <option value="10">10 produtos</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <!-- Melhor produto -->
      <div class="card mb-4 border-success">
        <div class="card-header bg-success text-white">
          <h4>🏆 Produto Recomendado</h4>
        </div>
        <div class="card-body">
          <h5 class="card-title">{{ bestProduct?.name }}</h5>
          <p><strong>Quantidade:</strong> {{ bestProduct?.quantity }} unidades</p>
          <p><strong>Lucro total:</strong> R$ {{ formatCurrency(bestProduct?.totalProfit) }}</p>
          <p><strong>Material limitante:</strong> {{ bestProduct?.limitingMaterial }}</p>
        </div>
      </div>

      <!-- Lista de produtos analisados -->
      <h4>📊 Análise dos Produtos</h4>
      <div class="row">
        <div v-for="product in analyses" :key="product.id" class="col-md-4 mb-3">
          <div class="card">
            <div class="card-header">
              <h5>{{ product.name }}</h5>
            </div>
            <div class="card-body">
              <p><strong>Lucro/unidade:</strong> R$ {{ formatCurrency(product.profitPerUnit) }}</p>
              <p><strong>Unidades possíveis:</strong> {{ product.maxUnitsPossible }}</p>
              <p><strong>Lucro total:</strong> R$ {{ formatCurrency(product.totalPossibleProfit) }}</p>
              <p><strong>Material limitante:</strong> {{ product.limitingMaterial }}</p>
              
              <h6>Composição por unidade:</h6>
              <ul>
                <li v-for="(qty, material) in product.materialsRequired" :key="material">
                  {{ material }}: {{ qty }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Estoque restante -->
      <div class="card mt-4">
        <div class="card-header bg-info text-white">
          <h4>📦 Estoque Restante</h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div v-for="(qty, material) in remainingStock" :key="material" class="col-md-4">
              <p><strong>{{ material }}:</strong> {{ qty }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recomendação em texto -->
      <div class="alert alert-secondary mt-4">
        <pre>{{ recommendation }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import productionApi from '../api/production';

export default {
  name: 'OptimizeView',
  setup() {
    const loading = ref(true);
    const error = ref(null);
    const topN = ref(3);
    const analyses = ref([]);
    const bestProduct = ref(null);
    const remainingStock = ref({});
    const recommendation = ref('');

    const formatCurrency = (value) => {
      return value?.toFixed(2).replace('.', ',') || '0,00';
    };

    const loadOptimization = async () => {
      try {
        loading.value = true;
        const response = await productionApi.optimize(topN.value);
        const data = response.data;
        
        analyses.value = data.productAnalyses || [];
        bestProduct.value = {
          name: data.bestProductName,
          quantity: data.bestProductQuantity,
          totalProfit: data.bestProductTotalProfit,
          limitingMaterial: data.limitingMaterial
        };
        remainingStock.value = data.materialsRemaining || {};
        recommendation.value = data.recommendation;
        
        error.value = null;
      } catch (err) {
        error.value = 'Erro ao carregar otimização';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(loadOptimization);

    return {
      loading,
      error,
      topN,
      analyses,
      bestProduct,
      remainingStock,
      recommendation,
      formatCurrency,
      loadOptimization
    };
  }
};
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  font-family: monospace;
}
</style>