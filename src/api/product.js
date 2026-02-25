import apiClient from './index';

export default {
  // Listar todos
  getAll() {
    return apiClient.get('/products');
  },
  
  // Buscar por ID
  getById(id) {
    return apiClient.get(`/products/${id}`);
  },
  
  // Buscar por código
  getByCode(code) {
    return apiClient.get(`/products/code/${code}`);
  },
  
  // Criar novo
  create(data) {
    return apiClient.post('/products', data);
  },
  
  // Atualizar
  update(id, data) {
    return apiClient.put(`/products/${id}`, data);
  },
  
  // Deletar
  delete(id) {
    return apiClient.delete(`/products/${id}`);
  },
  
  // Ver composição
  getComposition(id) {
    return apiClient.get(`/products/${id}/composition`);
  },
  
  // Análise do produto
  analyze(id) {
    return apiClient.get(`/products/${id}/analysis`);
  }
};