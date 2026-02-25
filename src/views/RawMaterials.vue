<template>
  <div class="container mt-4">
    <h2>📦 Raw Materials</h2>
    
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else>
      <button class="btn btn-success mb-3" @click="openCreateModal">
        ➕ New Raw Material
      </button>
      
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Actions</th>
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
              <button class="btn btn-sm btn-warning me-1" @click="edit(item)">✏️ Edit</button>
              <button class="btn btn-sm btn-danger me-1" @click="confirmDelete(item)">🗑️ Delete</button>
              <button class="btn btn-sm btn-info" @click="openStockModal(item)">📊 Stock</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Edit' : 'New' }} Raw Material</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="save">
              <div class="mb-3">
                <label class="form-label">Code</label>
                <input v-model="form.code" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model="form.name" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Stock Quantity</label>
                <input v-model.number="form.stockQuantity" type="number" step="0.01" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Unit of Measure</label>
                <select v-model="form.unitOfMeasure" class="form-select" required>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="unit">unit</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Adjustment Modal -->
    <div v-if="showStockModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Adjust Stock - {{ selectedMaterial?.name }}</h5>
            <button type="button" class="btn-close" @click="showStockModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Current stock: <strong>{{ selectedMaterial?.stockQuantity }} {{ selectedMaterial?.unitOfMeasure }}</strong></p>
            <div class="mb-3">
              <label class="form-label">Quantity</label>
              <input v-model.number="stockQuantity" type="number" step="0.01" class="form-control">
            </div>
            <button class="btn btn-success me-2" @click="addStock">Add</button>
            <button class="btn btn-warning" @click="removeStock">Remove</button>
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
  name: 'RawMaterialsView',
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
        error.value = 'Error loading raw materials';
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
        alert('Error saving: ' + (err.response?.data?.error || err.message));
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
      if (confirm(`Are you sure you want to delete ${item.name}?`)) {
        try {
          await rawMaterialApi.delete(item.id);
          await loadMaterials();
        } catch (err) {
          alert('Error deleting: ' + (err.response?.data?.error || err.message));
        }
      }
    };

    const openCreateModal = () => {
      resetForm();
      showCreateModal.value = true;
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
        alert('Error adding stock: ' + (err.response?.data?.error || err.message));
      }
    };

    const removeStock = async () => {
      try {
        await rawMaterialApi.removeStock(selectedMaterial.value.id, stockQuantity.value);
        await loadMaterials();
        showStockModal.value = false;
      } catch (err) {
        alert('Error removing stock: ' + (err.response?.data?.error || err.message));
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
      openCreateModal,
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