<template>
  <div class="container mt-4">
    <h2>📋 Produtos</h2>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button class="btn btn-outline-danger mt-2" @click="loadProducts">
        🔄 Tentar novamente
      </button>
    </div>
    
    <div v-else>
      <button class="btn btn-success mb-3" @click="openCreateModal">
        ➕ Novo Produto
      </button>
      
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Lucro</th>
            <th>Composição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td>{{ product.code }}</td>
            <td>{{ product.name }}</td>
            <td>R$ {{ formatCurrency(product.price) }}</td>
            <td>R$ {{ formatCurrency(product.profit) }}</td>
            <td>
              <button class="btn btn-sm btn-info" @click="viewComposition(product)">
                👁️ Ver
              </button>
            </td>
            <td>
              <button class="btn btn-sm btn-warning me-1" @click="editProduct(product)">
                ✏️
              </button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(product)">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Composição -->
    <div v-if="showCompositionModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Composição - {{ selectedProduct?.name }}</h5>
            <button type="button" class="btn-close" @click="showCompositionModal = false"></button>
          </div>
          <div class="modal-body">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Matéria-Prima</th>
                  <th>Quantidade</th>
                  <th>Unidade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedComposition" :key="item.rawMaterialId">
                  <td>{{ item.rawMaterialName }}</td>
                  <td>{{ item.requiredQuantity }}</td>
                  <td>{{ item.unitOfMeasure }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Criar/Editar Produto -->
    <div v-if="showProductModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Editar' : 'Novo' }} Produto</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Código</label>
                  <input v-model="form.code" class="form-control" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nome</label>
                  <input v-model="form.name" class="form-control" required>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Preço (R$)</label>
                  <input v-model.number="form.price" type="number" step="0.01" class="form-control" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Lucro (R$)</label>
                  <input v-model.number="form.profit" type="number" step="0.01" class="form-control" required>
                </div>
              </div>

              <h5 class="mt-3">Composição do Produto</h5>
              <p class="text-muted small">Selecione as matérias-primas e quantidades necessárias</p>

              <div v-for="(item, index) in form.composition" :key="index" class="row mb-2">
                <div class="col-md-5">
                  <select v-model="item.rawMaterialCode" class="form-select" required>
                    <option value="">Selecione...</option>
                    <option v-for="material in rawMaterials" :key="material.code" :value="material.code">
                      {{ material.name }} ({{ material.unitOfMeasure }})
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <input v-model.number="item.requiredQuantity" type="number" step="0.01" class="form-control" placeholder="Quantidade" required>
                </div>
                <div class="col-md-2">
                  <button type="button" class="btn btn-danger" @click="removeComposition(index)">🗑️</button>
                </div>
              </div>

              <button type="button" class="btn btn-secondary mt-2" @click="addComposition">
                ➕ Adicionar Matéria-Prima
              </button>

              <div class="mt-4">
                <button type="submit" class="btn btn-primary">Salvar</button>
                <button type="button" class="btn btn-secondary ms-2" @click="closeModal">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import productApi from '../api/product';
import rawMaterialApi from '../api/rawMaterial';

export default {
  name: 'ProductsView',
  setup() {
    const products = ref([]);
    const rawMaterials = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showProductModal = ref(false);
    const showCompositionModal = ref(false);
    const editing = ref(false);
    const selectedProduct = ref(null);
    const selectedComposition = ref([]);

    const form = ref({
      code: '',
      name: '',
      price: 0,
      profit: 0,
      composition: []
    });

    const formatCurrency = (value) => {
      return value?.toFixed(2).replace('.', ',') || '0,00';
    };

    const loadProducts = async () => {
      try {
        loading.value = true;
        const response = await productApi.getAll();
        products.value = response.data;
        error.value = null;
      } catch (err) {
        error.value = 'Erro ao carregar produtos';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const loadRawMaterials = async () => {
      try {
        const response = await rawMaterialApi.getAll();
        rawMaterials.value = response.data;
      } catch (err) {
        console.error('Erro ao carregar matérias-primas:', err);
      }
    };

    const resetForm = () => {
      form.value = {
        code: '',
        name: '',
        price: 0,
        profit: 0,
        composition: []
      };
      editing.value = false;
      selectedProduct.value = null;
    };

    const openCreateModal = async () => {
      await loadRawMaterials();
      resetForm();
      showProductModal.value = true;
    };

    const editProduct = async (product) => {
      await loadRawMaterials();
      selectedProduct.value = product;
      
      // Buscar composição detalhada
      try {
        const response = await productApi.getComposition(product.id);
        form.value = {
          code: product.code,
          name: product.name,
          price: product.price,
          profit: product.profit,
          composition: response.data.map(item => ({
            rawMaterialCode: item.rawMaterialCode,
            requiredQuantity: item.requiredQuantity
          }))
        };
        editing.value = true;
        showProductModal.value = true;
      } catch (err) {
        alert('Erro ao carregar composição do produto');
      }
    };

    const viewComposition = async (product) => {
      try {
        const response = await productApi.getComposition(product.id);
        selectedProduct.value = product;
        selectedComposition.value = response.data;
        showCompositionModal.value = true;
      } catch (err) {
        alert('Erro ao carregar composição');
      }
    };

    const confirmDelete = async (product) => {
      if (confirm(`Deseja realmente deletar ${product.name}?`)) {
        try {
          await productApi.delete(product.id);
          await loadProducts();
        } catch (err) {
          alert('Erro ao deletar: ' + (err.response?.data?.error || err.message));
        }
      }
    };

    const addComposition = () => {
      form.value.composition.push({
        rawMaterialCode: '',
        requiredQuantity: 0
      });
    };

    const removeComposition = (index) => {
      form.value.composition.splice(index, 1);
    };

    const saveProduct = async () => {
      try {
        // Validar composição
        if (form.value.composition.length === 0) {
          alert('Adicione pelo menos uma matéria-prima à composição');
          return;
        }

        // Validar se todos os campos da composição estão preenchidos
        for (const item of form.value.composition) {
          if (!item.rawMaterialCode || item.requiredQuantity <= 0) {
            alert('Preencha todos os campos da composição corretamente');
            return;
          }
        }

        if (editing.value) {
          await productApi.update(selectedProduct.value.id, form.value);
        } else {
          await productApi.create(form.value);
        }
        
        await loadProducts();
        closeModal();
      } catch (err) {
        alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
      }
    };

    const closeModal = () => {
      showProductModal.value = false;
      resetForm();
    };

    onMounted(() => {
      loadProducts();
    });

    return {
      products,
      rawMaterials,
      loading,
      error,
      showProductModal,
      showCompositionModal,
      editing,
      selectedProduct,
      selectedComposition,
      form,
      formatCurrency,
      openCreateModal,
      editProduct,
      viewComposition,
      confirmDelete,
      addComposition,
      removeComposition,
      saveProduct,
      closeModal
    };
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0,0,0,0.5);
}
</style>