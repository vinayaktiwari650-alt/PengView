import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageViewer } from './components/ImageViewer';
import { PortfolioGenerator } from './components/PortfolioGenerator';
import { SiteContextRenderer } from './components/SiteContextRenderer';
import { Login } from './components/Login';
import { ProjectsModal } from './components/ProjectsModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import * as storage from './utils/storage';
import type { ImageFile, PortfolioData, SiteContextData, Project } from './types';

function App() {
  // App State
  const [image, setImage] = useState<ImageFile | null>(null);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [siteContextData, setSiteContextData] = useState<SiteContextData | null>(null);

  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  // Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // UI State
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  
  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) {
      handleLogin(user);
    }
  }, []);
  
  const handleLogin = (username: string) => {
    storage.setCurrentUser(username);
    setCurrentUser(username);
    const userProjects = storage.getUserProjects(username);
    setProjects(userProjects);
  };
  
  const handleLogout = () => {
    storage.clearCurrentUser();
    setCurrentUser(null);
    setProjects([]);
    handleNewProject(true); // Force clear without confirmation
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleNewProject(true); // Clear existing project on new upload
      setImage({
        file,
        dataUrl: reader.result as string,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleNewProject = (force = false) => {
    if (!force && image) {
        if (!window.confirm('This will clear your current work. Are you sure you want to start a new project? Save your work first.')) {
            return;
        }
    }
    setImage(null);
    setPortfolioData(null);
    setSiteContextData(null);
    setCurrentProjectId(null);
  }

  const handleOpenSaveModal = () => {
    if (!image) {
      alert("Please upload an image before saving.");
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveProject = (projectName: string) => {
    if (!currentUser || !image) return;

    const project: Project = {
      id: currentProjectId || Date.now().toString(),
      name: projectName,
      createdAt: new Date().toISOString(),
      image: { dataUrl: image.dataUrl, type: image.type },
      portfolioData,
      siteContextData,
    };

    storage.saveUserProject(currentUser, project);
    setCurrentProjectId(project.id);
    setProjects(storage.getUserProjects(currentUser));
    setIsSaveModalOpen(false);
  };
  
  const handleLoadProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
        setImage({ file: new File([], ""), ...project.image });
        setPortfolioData(project.portfolioData);
        setSiteContextData(project.siteContextData);
        setCurrentProjectId(project.id);
        setIsProjectsModalOpen(false);
    }
  };
  
  const handleDeleteProject = (projectId: string) => {
    if (!currentUser) return;
    storage.deleteUserProject(currentUser, projectId);
    setProjects(storage.getUserProjects(currentUser));
  };
  
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }
  
  const currentProjectName = projects.find(p => p.id === currentProjectId)?.name;

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
        <Header currentUser={currentUser} onLogout={handleLogout} onOpenProjects={() => setIsProjectsModalOpen(true)} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!image ? (
            <div className="max-w-xl mx-auto">
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 flex flex-col gap-4 sticky top-24 self-start">
                  <div className="relative group">
                      <ImageViewer title={currentProjectName || "Current Project"} imageUrl={image.dataUrl} />
                  </div>
                   <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleOpenSaveModal} className="w-full text-sm py-2 px-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586L7.707 10.293zM5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5z" /></svg>
                            {currentProjectId ? 'Update' : 'Save'}
                        </button>
                         <button onClick={() => handleNewProject()} className="w-full text-sm py-2 px-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            New Project
                        </button>
                    </div>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-12">
                <section id="portfolio-generator">
                  <PortfolioGenerator image={image} portfolioData={portfolioData} setPortfolioData={setPortfolioData} />
                </section>
                <hr className="border-gray-700" />
                <section id="site-context-renderer">
                  <SiteContextRenderer image={image} siteContextData={siteContextData} setSiteContextData={setSiteContextData} />
                </section>
              </div>
            </div>
          )}
        </main>
      </div>
      <ProjectsModal 
        isOpen={isProjectsModalOpen} 
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
       />
       <SaveProjectModal 
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveProject}
        currentProjectName={currentProjectName}
       />
    </>
  );
}

export default App;