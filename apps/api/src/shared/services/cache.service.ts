import NodeCache from 'node-cache';

/**
 * CacheService implementation
 * Following singleton pattern to maintain a shared cache instance.
 */
export class CacheService {
    private static instance: CacheService;
    private cache: NodeCache;

    private constructor() {
        // Standard TTL 300 seconds (5 minutes), check period 60 seconds
        this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
        console.log('CacheService initialized.');
    }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    public get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    public set<T>(key: string, value: T, ttl?: number): boolean {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }

    public del(keys: string | string[]): number {
        return this.cache.del(keys);
    }

    public flush(): void {
        this.cache.flushAll();
        console.log('Cache flushed.');
    }
}
