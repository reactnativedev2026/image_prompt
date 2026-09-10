import axios from 'axios';

export const BASE_URL = 'https://prompttrending.online';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiPrompt {
  id: number;
  image_url: string;
  prompt_text: string;
  view_count: number;
  category_id: number;
  is_trending?: boolean;
}

export interface ApiCategory {
  id: number;
  name: string;
}

export const fetchCategories = async (): Promise<ApiCategory[]> => {
  try {
    const response = await api.get('/api/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchPrompts = async (
  categoryId?: number,
  search?: string,
  isTrending?: boolean,
  page: number = 1,
  limit: number = 21
): Promise<ApiPrompt[]> => {
  try {
    const params: any = {
      page,
      limit,
    };
    if (categoryId) {
      params.category_id = categoryId;
    }
    if (search) {
      params.search = search;
    }
    if (typeof isTrending === 'boolean') {
      params.is_trending = isTrending;
    }
    const response = await api.get('/api/prompts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
};

export const fetchTrendingPrompts = async (
  categoryId?: number,
  page: number = 1,
  limit: number = 20
): Promise<ApiPrompt[]> => {
  try {
    const params: any = { page, limit };
    if (categoryId) {
      params.category_id = categoryId;
    }
    const response = await api.get('/api/prompts/trending', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trending prompts:', error);
    return [];
  }
};

export const incrementViewCount = async (id: number): Promise<void> => {
  try {
    await api.post(`/api/prompts/${id}/view`);
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};
