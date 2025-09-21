/**
 * Enhanced Data Loader with Loading State Management
 * Wraps existing data loading functions with consistent error handling and retry logic
 * Requirements: 8.3, 8.4, 8.5
 */

import { loadingManager, LoadingOptions } from './loadingStateManager';

// Import existing data loaders
import { loadACData } from './loadACData';
import { loadMandalData } from './loadMandalData';
import { loadACTargetData } from './loadACTargetData';
import { loadMandalTargetData } from './loadMandalTargetData';
import { loadACVoteShareData } from './loadACVoteShareData';
import { loadMandalVoteShareData } from './loadMandalVoteShareData';
import { loadLocalBodyVoteShareData } from './loadLocalBodyVoteShareData';
import { loadMandalContactData } from './loadMandalContactData';
import { loadOrgDistrictTargetData } from './loadOrgDistrictTargetData';
import { loadOrgDistrictContacts } from './loadOrgDistrictContacts';
import { loadZoneTargetData } from './loadZoneTargetData';

/**
 * Enhanced data loader configuration
 */
interface DataLoaderConfig extends LoadingOptions {
  cacheKey?: string;
  cacheDuration?: number;
}

/**
 * Default configuration for data loading
 */
const DEFAULT_CONFIG: Required<DataLoaderConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  preventUserInteraction: true,
  cacheKey: '',
  cacheDuration: 5 * 60 * 1000 // 5 minutes
};

/**
 * Enhanced data loader class
 */
class EnhancedDataLoader {
  private cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Generic data loader with loading state management
   */
  async loadData<T>(
    id: string,
    loader: () => Promise<T>,
    config: Partial<DataLoaderConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const cacheKey = finalConfig.cacheKey || id;

    // Check cache first
    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < finalConfig.cacheDuration) {
        console.log(`📦 Loading ${id} from cache`);
        return cached.data;
      }
    }

    // Execute with loading state management
    const result = await loadingManager.execute({
      id,
      operation: async () => {
        console.log(`🌐 Loading ${id} from source`);
        const data = await loader();
        
        // Cache the result
        if (cacheKey) {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }
        
        return data;
      },
      options: finalConfig
    });

    return result;
  }

  /**
   * Clear cache for specific key or all cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache status
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const dataLoader = new EnhancedDataLoader();

/**
 * Enhanced data loading functions with loading state management
 */

export const enhancedLoadACData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('ac-data', loadACData, { cacheKey: 'ac-data', ...config });

export const enhancedLoadMandalData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('mandal-data', loadMandalData, { cacheKey: 'mandal-data', ...config });

export const enhancedLoadACTargetData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('ac-target-data', loadACTargetData, { cacheKey: 'ac-target-data', ...config });

export const enhancedLoadMandalTargetData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('mandal-target-data', loadMandalTargetData, { cacheKey: 'mandal-target-data', ...config });

export const enhancedLoadACVoteShareData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('ac-vote-share-data', loadACVoteShareData, { cacheKey: 'ac-vote-share-data', ...config });

export const enhancedLoadMandalVoteShareData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('mandal-vote-share-data', loadMandalVoteShareData, { cacheKey: 'mandal-vote-share-data', ...config });

export const enhancedLoadLocalBodyVoteShareData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('local-body-vote-share-data', loadLocalBodyVoteShareData, { cacheKey: 'local-body-vote-share-data', ...config });

export const enhancedLoadMandalContactData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('mandal-contact-data', loadMandalContactData, { cacheKey: 'mandal-contact-data', ...config });

export const enhancedLoadOrgDistrictTargetData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('org-district-target-data', loadOrgDistrictTargetData, { cacheKey: 'org-district-target-data', ...config });

export const enhancedLoadOrgDistrictContacts = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('org-district-contacts', loadOrgDistrictContacts, { cacheKey: 'org-district-contacts', ...config });

export const enhancedLoadZoneTargetData = (config?: Partial<DataLoaderConfig>) =>
  dataLoader.loadData('zone-target-data', loadZoneTargetData, { cacheKey: 'zone-target-data', ...config });

/**
 * Batch data loader for loading multiple datasets
 */
export async function loadMultipleDatasets(
  datasets: Array<{
    id: string;
    loader: () => Promise<any>;
    config?: Partial<DataLoaderConfig>;
  }>
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const errors: Record<string, Error> = {};

  // Load all datasets in parallel
  const promises = datasets.map(async ({ id, loader, config }) => {
    try {
      const data = await dataLoader.loadData(id, loader, config);
      results[id] = data;
    } catch (error) {
      errors[id] = error instanceof Error ? error : new Error(String(error));
      console.error(`Failed to load ${id}:`, error);
    }
  });

  await Promise.allSettled(promises);

  // If any critical datasets failed, throw an error
  if (Object.keys(errors).length > 0) {
    const errorMessage = `Failed to load datasets: ${Object.keys(errors).join(', ')}`;
    throw new Error(errorMessage);
  }

  return results;
}

/**
 * Preload commonly used datasets
 */
export async function preloadCommonData(): Promise<void> {
  console.log('🚀 Preloading common datasets...');
  
  try {
    await loadMultipleDatasets([
      { id: 'ac-data', loader: loadACData },
      { id: 'mandal-data', loader: loadMandalData },
      { id: 'ac-target-data', loader: loadACTargetData },
      { id: 'mandal-target-data', loader: loadMandalTargetData }
    ]);
    
    console.log('✅ Common datasets preloaded successfully');
  } catch (error) {
    console.error('❌ Failed to preload common datasets:', error);
  }
}

/**
 * Data loading hooks for React components
 */
export function useEnhancedDataLoader() {
  return {
    loadACData: enhancedLoadACData,
    loadMandalData: enhancedLoadMandalData,
    loadACTargetData: enhancedLoadACTargetData,
    loadMandalTargetData: enhancedLoadMandalTargetData,
    loadACVoteShareData: enhancedLoadACVoteShareData,
    loadMandalVoteShareData: enhancedLoadMandalVoteShareData,
    loadLocalBodyVoteShareData: enhancedLoadLocalBodyVoteShareData,
    loadMandalContactData: enhancedLoadMandalContactData,
    loadOrgDistrictTargetData: enhancedLoadOrgDistrictTargetData,
    loadOrgDistrictContacts: enhancedLoadOrgDistrictContacts,
    loadZoneTargetData: enhancedLoadZoneTargetData,
    loadMultiple: loadMultipleDatasets,
    preloadCommon: preloadCommonData,
    clearCache: dataLoader.clearCache.bind(dataLoader),
    getCacheInfo: dataLoader.getCacheInfo.bind(dataLoader)
  };
}

// Export the data loader instance for direct use
export { dataLoader };