import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { BuildingAnalyzer } from './components/BuildingAnalyzer';
import { PortfolioGenerator } from './components/PortfolioGenerator';
import type { ImageFile, PortfolioData, AnalysisData } from './types';

function App() {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({
        file,
        dataUrl: reader.result as string,
        type: file.type,
      });
      // Reset tool data on new image upload
      setPortfolioData(null);
      setAnalysisData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
      setImage(null);
      setPortfolioData(null);
      setAnalysisData(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!image ? (
          <div className="max-w-xl mx-auto">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-6 sticky top-24 self-start">
                <div className="relative group">
                    <ImageViewer title="Uploaded Image" imageUrl={image.dataUrl} />
                    <button 
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-12">
              <section id="portfolio-generator">
                <PortfolioGenerator image={image} portfolioData={portfolioData} setPortfolioData={setPortfolioData} />
              </section>
              <hr className="border-gray-700" />
              <section id="building-analyzer">
                 <BuildingAnalyzer image={image} analysisData={analysisData} setAnalysisData={setAnalysisData} />
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;