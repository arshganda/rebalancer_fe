import { get, post, put } from './request'
import { getCid } from "./auth"

export const getPortfolios = async (ctx = {}) => {
  try {
    const { data } = await get(`/portfolios`, getCid(ctx));
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const getFunds = async (ctx = {}) => {
  try {
    const { data } = await get(`/funds`);
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const getRecommendationAvailability = async (portfolioId, ctx ={}) => {
  try {
    const { data } = await get(`/portfolio/${portfolioId}/recommendations/available`, getCid(ctx));
    return data;
  } catch (error) {
    return false;
  }
}

export const getPortfolioRecommendations = async (portfolioId, ctx = {}) => {
  try {
    const { data } = await get(`/portfolio/${portfolioId}/rebalance`, getCid(ctx));
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const requestRebalance = async (portfolioId, ctx = {}) => {
  try {
    const { data } = await post(`/portfolio/${portfolioId}/rebalance`, {}, getCid(ctx));
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const putDeviation = async (pid, deviation, ctx ={}) => {
  try {
    const { data } = await put(`/portfolio/${pid}/deviation`, {deviation}, getCid(ctx));
    if (data === "") {
      return { error: 'TO BE DEFINED'}
    }
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const postPortfolioSettings = async(pid, deviation, type, allocations, ctx ={}) => {

  const requestData = {
    deviation,
    type,
    allocations
  }

   try {
     const { data } = await post(`/portfolio/${pid}`, requestData , getCid(ctx));
     if (data === "") {
       return { error: 'TODO' }
     }
     return data;
   } catch (error) {
     return { error: error.toString() }
   }
}

export const postExecuteRecommendation = async(pid, recommendationId, ctx = {}) => {
  try {
    const { data } = await post(`/portfolio/${pid}/recommendation/${recommendationId}/execute`, { recommendationId } , getCid(ctx));
    if (data === "") {
      return { error: 'TODO' }
    }
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const putModifyRecommendation = async(pid, recommendationId, transactions, ctx = {}) => {
  try {
    const { data } = await put(`/portfolio/${pid}/recommendation/${recommendationId}/modify`, transactions , getCid(ctx));
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const getPortfolioSettings = async (pid, ctx = {}) => {
  try {
    const { data } = await get(`/portfolio/${pid}`, getCid(ctx));
    return data;
  } catch (error) {
    return { error: error.toString() }
  }
}

export const authenticateUser = async (cid) => {
  try {
    const { data } = await get(`/portfolios`, cid);
    if (data === "") {
      return { error: 'Invalid user' }
    }
    return data;  
  } catch (error) {
    return { error: error.toString() }
  }
}