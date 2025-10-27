import React, { useState, useCallback } from 'react';
import { Spinner } from './Spinner';
import { ImageViewer } from './ImageViewer';
import { renderBuildingOnSite } from '../services/geminiService';
import type { ImageFile, SiteContextData } from '../types';
import { fileToGenerativePart } from '../utils/fileUtils';

interface SiteContextRendererProps {
  image: ImageFile;
  siteContextData: SiteContextData | null;
  setSiteContextData: React.Dispatch<React.SetStateAction<SiteContextData | null>>;
}

export const SiteContextRenderer: React.FC<SiteContextRendererProps> = ({ image, siteContextData, setSiteContextData }) => {
  const [error, setError] = useState<string | null>(null);

  const siteImage = siteContextData?.siteImage || null;
  const renderUrl = siteContextData?.renderUrl || null;
  const progress = siteContextData?.progress || 'idle';
  const isLoading = progress === 'loading';

  const handleSiteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteContextData({
          siteImage: {
            dataUrl: reader.result as string,
            type: file.type,
          },
          renderUrl: null, // Reset render if a new site image is uploaded
          progress: 'idle',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!siteImage) {
      setError("Please upload a site context image first.");
      return;
    }
    setError(null);
    setSiteContextData(prev => ({ ...prev!, progress: 'loading' }));

    try {
      const buildingImagePart = await fileToGenerativePart(image.dataUrl, image.type);
      const siteImagePart = await fileToGenerativePart(siteImage.dataUrl, siteImage.type);
      const resultUrl = await renderBuildingOnSite(buildingImagePart, siteImagePart);

      setSiteContextData(prev => ({
        ...prev!,
        renderUrl: resultUrl,
        progress: 'success',
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      setSiteContextData(prev => ({ ...prev!, progress: 'error' }));
    }
  }, [image, siteImage, setSiteContextData]);

  const handleDownloadRender = () => {
    if (!renderUrl) return;
    const link = document.createElement('a');
    link.href = renderUrl;
    link.download = `PengVision_Site_Render.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-white">Site Context Renderer</h2>
      <p className="text-sm text-gray-400 -mt-4">
        Place your building in a real-world context. Upload a screenshot from a map of your desired location.
      </p>

      {!siteImage ? (
        <label htmlFor="site-image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 border-gray-600 bg-gray-900/50 hover:bg-gray-800">
          <div className="flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
            <p className="font-semibold text-white">Upload Site Photo</p>
            <p className="text-xs text-gray-500">e.g., a map screenshot</p>
          </div>
          <input id="site-image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleSiteImageUpload} />
        </label>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 text-center">Site Context</h3>
              <img src={siteImage.dataUrl} alt="Site context" className="w-full rounded-lg object-contain border border-gray-700" />
            </div>
             <div className="self-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 sm:rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex-1">
               <h3 className="text-sm font-semibold text-gray-400 mb-2 text-center">Building</h3>
               <img src={image.dataUrl} alt="Building" className="w-full rounded-lg object-contain border border-gray-700" />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-gray-200 disabled:bg-gray-500 text-black font-bold text-lg rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            {isLoading ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
            {isLoading ? 'Generating Render...' : 'Generate Site Render'}
          </button>
        </div>
      )}

      {error && (
        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center flex-col gap-2 p-8 text-gray-400">
            <Spinner large />
            <p>Placing building on site... this may take a moment.</p>
        </div>
      )}

      {renderUrl && progress === 'success' && (
        <div className="mt-4">
          <ImageViewer
            title="Final Site Render"
            imageUrl={renderUrl}
            onDownload={handleDownloadRender}
          />
        </div>
      )}
    </div>
  );
};
