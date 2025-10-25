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

export interface AnalysisAsset {
  title: string;
  imageUrl: string;
}

export interface AnalysisData {
  text: string | null;
  assets: AnalysisAsset[];
  progress: Record<string, 'loading' | 'success' | 'error'>;
}

// FIX: Define and export the NarratorData interface for the AiNarrator component.
export interface NarratorView {
  title: string;
  imageUrl: string;
}

export interface NarratorData {
  views: NarratorView[];
  script: string | null;
  audioUrl: string | null;
  progress: Record<string, 'loading' | 'success' | 'error'>;
}
