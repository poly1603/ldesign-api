import { type RefObject } from 'react';
export interface UseIntersectionOptions {
    root?: Element | null;
    rootMargin?: string;
    threshold?: number;
}
export declare function useIntersectionObserver(target: RefObject<Element | null>, onIntersect: (entry: IntersectionObserverEntry) => void, options?: UseIntersectionOptions): void;
