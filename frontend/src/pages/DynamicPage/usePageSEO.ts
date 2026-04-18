import { useEffect } from 'react';

type DynamicPageInfo = {
  name_ar?: string | null;
  name_en?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
};

type UsePageSEOArgs = {
  pageInfo: DynamicPageInfo | null;
  rtl: boolean;
  storeName: string;
};

export function usePageSEO({ pageInfo, rtl, storeName }: UsePageSEOArgs) {
  useEffect(() => {
    const previousTitle = document.title;
    const existingMetaDesc = document.querySelector('meta[name="description"]');
    const previousDescription = existingMetaDesc?.getAttribute('content') || '';

    if (!pageInfo) {
      return;
    }

    const pageName = rtl ? pageInfo.name_ar : pageInfo.name_en;
    document.title = pageInfo.meta_title || `${pageName || ''} | ${storeName}`;

    let metaDesc = existingMetaDesc;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', pageInfo.meta_desc || '');

    return () => {
      document.title = previousTitle;
      const currentMetaDesc = document.querySelector('meta[name="description"]');
      if (currentMetaDesc) {
        currentMetaDesc.setAttribute('content', previousDescription);
      }
    };
  }, [pageInfo, rtl, storeName]);
}
