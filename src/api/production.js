// src/api/production.js
import apiClient from './index';

export default {
  // Otimizar produção (com parâmetro opcional topN)
  optimize(topN = 3) {
    return apiClient.get(`/production/optimize?topN=${topN}`);
  },
  
  // Simular produção
  simulate(id, quantity) {
    return apiClient.post(`/products/${id}/simulate?quantity=${quantity}`);
  },
  
  // Produzir (consumir matérias-primas)
  produce(id, quantity) {
    return apiClient.post(`/products/${id}/produce?quantity=${quantity}`);
  }
};