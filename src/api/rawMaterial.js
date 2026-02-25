// src/api/rawMaterial.js
import apiClient from './index';

export default {
  // Listar todas
  getAll() {
    return apiClient.get('/raw-materials');
  },
  
  // Buscar por ID
  getById(id) {
    return apiClient.get(`/raw-materials/${id}`);
  },
  
  // Buscar por código
  getByCode(code) {
    return apiClient.get(`/raw-materials/code/${code}`);
  },
  
  // Criar nova
  create(data) {
    return apiClient.post('/raw-materials', data);
  },
  
  // Atualizar
  update(id, data) {
    return apiClient.put(`/raw-materials/${id}`, data);
  },
  
  // Deletar
  delete(id) {
    return apiClient.delete(`/raw-materials/${id}`);
  },
  
  // Adicionar ao estoque
  addStock(id, quantity) {
    return apiClient.patch(`/raw-materials/${id}/stock/add?quantity=${quantity}`);
  },
  
  // Remover do estoque
  removeStock(id, quantity) {
    return apiClient.patch(`/raw-materials/${id}/stock/remove?quantity=${quantity}`);
  }
};