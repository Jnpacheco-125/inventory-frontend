<template>
  <div class="container mt-4">
    <h2>📦 Matérias-Primas</h2>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else>
      <button class="btn btn-success mb-3" @click="showCreateModal = true">
        ➕ Nova Matéria-Prima
      </button>
      
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nome</th>
            <th>Quantidade</th>
            <th>Unidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in materials" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.stockQuantity }}</td>
            <td>{{ item.unitOfMeasure }}</td>
            <td>
              <button class="btn btn-sm btn-warning" @click="edit(item)">✏️</button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(item)">🗑️</button>
              <button class="btn btn-sm btn-info" @click="openStockModal(item)">📊</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de criação/edição -->
    <div v-if="showCreateModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Editar' : 'Nova' }} Matéria-Prima</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="save">
              <div class="mb-3">
                <label class="form-label">Código</label>
                <input v-model="form.code" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Nome</label>
                <input v-model="form.name" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Quantidade em Estoque</label>
                <input v-model.number="form.stockQuantity" type="number" step="0.01" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Unidade de Medida</label>
                <select v-model="form.unitOfMeasure" class="form-select" required>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="unidade">unidade</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de ajuste de estoque -->
    <div v-if="showStockModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Ajustar Estoque - {{ selectedMaterial?.name }}</h5>
            <button type="button" class="btn-close" @click="showStockModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Estoque atual: <strong>{{ selectedMaterial?.stockQuantity }} {{ selectedMaterial?.unitOfMeasure }}</strong></p>
            <div class="mb-3">
              <label class="form-label">Quantidade</label>
              <input v-model.number="stockQuantity" type="number" step="0.01" class="form-control">
            </div>
            <button class="btn btn-success me-2" @click="addStock">Adicionar</button>
            <button class="btn btn-warning" @click="removeStock">Remover</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import rawMaterialApi from '../api/rawMaterial';

export default {
  setup() {
    const materials = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const showCreateModal = ref(false);
    const showStockModal = ref(false);
    const editing = ref(false);
    const selectedMaterial = ref(null);
    const stockQuantity = ref(0);
    
    const form = reactive({
      code: '',
      name: '',
      stockQuantity: 0,
      unitOfMeasure: 'kg'
    });

    const loadMaterials = async () => {
      try {
        loading.value = true;
        const response = await rawMaterialApi.getAll();
        materials.value = response.data;
        error.value = null;
      } catch (err) {
        error.value = 'Erro ao carregar matérias-primas';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      form.code = '';
      form.name = '';
      form.stockQuantity = 0;
      form.unitOfMeasure = 'kg';
      editing.value = false;
    };

    const save = async () => {
      try {
        if (editing.value) {
          await rawMaterialApi.update(selectedMaterial.value.id, form);
        } else {
          await rawMaterialApi.create(form);
        }
        await loadMaterials();
        closeModal();
      } catch (err) {
        alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
      }
    };

    const edit = (item) => {
      selectedMaterial.value = item;
      form.code = item.code;
      form.name = item.name;
      form.stockQuantity = item.stockQuantity;
      form.unitOfMeasure = item.unitOfMeasure;
      editing.value = true;
      showCreateModal.value = true;
    };

    const confirmDelete = async (item) => {
      if (confirm(`Deseja realmente deletar ${item.name}?`)) {
        try {
          await rawMaterialApi.delete(item.id);
          await loadMaterials();
        } catch (err) {
          alert('Erro ao deletar: ' + (err.response?.data?.error || err.message));
        }
      }
    };

    const openStockModal = (item) => {
      selectedMaterial.value = item;
      stockQuantity.value = 0;
      showStockModal.value = true;
    };

    const addStock = async () => {
      try {
        await rawMaterialApi.addStock(selectedMaterial.value.id, stockQuantity.value);
        await loadMaterials();
        showStockModal.value = false;
      } catch (err) {
        alert('Erro ao adicionar: ' + (err.response?.data?.error || err.message));
      }
    };

    const removeStock = async () => {
      try {
        await rawMaterialApi.removeStock(selectedMaterial.value.id, stockQuantity.value);
        await loadMaterials();
        showStockModal.value = false;
      } catch (err) {
        alert('Erro ao remover: ' + (err.response?.data?.error || err.message));
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showStockModal.value = false;
      resetForm();
    };

    onMounted(loadMaterials);

    return {
      materials,
      loading,
      error,
      showCreateModal,
      showStockModal,
      editing,
      selectedMaterial,
      stockQuantity,
      form,
      save,
      edit,
      confirmDelete,
      openStockModal,
      addStock,
      removeStock,
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