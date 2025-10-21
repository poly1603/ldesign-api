/**
 * v-intersect 指令
 * 在元素进入可视区域时触发回调，支持 once/delay/options 配置。
 *
 * 使用示例：
 * <div v-intersect="() => loadMore()" />
 * <div v-intersect="{ callback: () => loadMore(), once: true, delay: 100, options: { rootMargin: '0px 0px 100px 0px' } }" />
 */
import type { Directive } from 'vue';
interface IntersectValue {
    callback: (entry: IntersectionObserverEntry) => void;
    options?: {
        root?: Element | null;
        rootMargin?: string;
        threshold?: number;
    };
    once?: boolean;
    delay?: number;
}
export declare const vIntersect: Directive<HTMLElement, ((entry: IntersectionObserverEntry) => void) | IntersectValue>;
export {};
