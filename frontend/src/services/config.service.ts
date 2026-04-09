import api from './api';
import type { SiteConfig } from '../types';

export const configService = {
  async getSiteConfig(): Promise<SiteConfig> {
    const { data } = await api.get<SiteConfig>('/config');
    return data;
  },

  async updateSiteConfig(config: Partial<SiteConfig>): Promise<SiteConfig> {
    const { data } = await api.put<SiteConfig>('/config', config);
    return data;
  },
};
