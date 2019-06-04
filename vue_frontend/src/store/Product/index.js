import actions from './actions';
import mutations from './mutations';

export const state = {
  products: [],
};

export const Product =  {
  namespaced: true,
  state,
  actions,
  mutations,
};
