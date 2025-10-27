export interface ImageFile {
  file: File;
  dataUrl: string;
  type: string;
}

export interface PortfolioAsset {
  title: string;
  imageUrl: string;
}

export interface PortfolioData {
  assets: PortfolioAsset[];
  progress: Record<string, 'loading' | 'success' | 'error'>;
}

export interface SiteContextData {
  siteImage: {
    dataUrl: string;
    type: string;
  } | null;
  renderUrl: string | null;
  progress: 'idle' | 'loading' | 'success' | 'error';
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  image: {
    dataUrl: string;
    type: string;
  };
  portfolioData: PortfolioData | null;
  siteContextData: SiteContextData | null;
}

// FIX: Add AnalysisData type for BuildingAnalyzer component state.
export interface AnalysisData {
  text: string | null;
  assets: PortfolioAsset[];
  progress: Record<string, 'loading' | 'success' | 'error'>;
}

// FIX: Add NarratorData type for AiNarrator component state.
export interface NarratorData {
  views: PortfolioAsset[];
  script: string | null;
  audioUrl: string | null;
  progress: Record<string, 'loading' | 'success' | 'error'>;
}
