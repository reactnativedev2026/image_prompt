import axios from 'axios';

export const BASE_URL = 'http://66.116.249.117';

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

export const fetchPrompts = async (categoryId?: number, search?: string): Promise<ApiPrompt[]> => {
  try {
    const params: any = {
      limit: 100,
    };
    if (categoryId) {
      params.category_id = categoryId;
    }
    if (search) {
      params.search = search;
    }
    const response = await api.get('/api/prompts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching prompts:', error);
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
