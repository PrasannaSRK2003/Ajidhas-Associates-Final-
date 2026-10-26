import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Art from './pages/Art/Art';
import ArtLanding from './pages/ArtLanding/ArtLanding';
import ArchitectureLanding from './pages/ArchitectureLanding/ArchitectureLanding';
import ArchitectureProjects from './pages/ArchitectureProjects/ArchitectureProjects';
import ArchitectureAllWork from './pages/ArchitectureAllWork/ArchitectureAllWork';
import ArchitectureProjectDetail from './pages/ArchitectureProjectDetail/ArchitectureProjectDetail';
import Interior from './pages/Interior/Interior';
import InteriorProjectList from './pages/Interior/InteriorProjectList';
import ArchitectureContact from './pages/ArchitectureLanding/ArchitectureContact';
import ArchitectureInquiry from './pages/ArchitectureLanding/ArchitectureInquiry';
import Artist from './pages/Artist/Artist';
import GallerySeries from './pages/GallerySeries/GallerySeries';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import ProjectPreview from './pages/ProjectPreview/ProjectPreview';
import './index.css';

import About from './pages/About/About';
import Visualisation from './pages/Visualisation/Visualisation';
import Technology from './pages/Technology/Technology';
import Landscape from './pages/Landscape/Landscape';
import Collaboration from './pages/Collaboration/Collaboration';
import Contact from './pages/Contact/Contact';

function App() {
  return (
    <ContentProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/architecture/about" element={<About />} />
            <Route path="/architecture/visualisation" element={<Visualisation />} />
            <Route path="/art" element={<ArtLanding />} />
            <Route path="/art/gallery" element={<GallerySeries />} />
            <Route path="/art/preview/:id" element={<ProjectPreview />} />
            <Route path="/art/project/:id" element={<ProjectDetail />} />
            <Route path="/art/artist" element={<Artist />} />
            <Route path="/architecture" element={<ArchitectureLanding />} />
            <Route path="/architecture/projects" element={<ArchitectureProjects />} />
            <Route path="/architecture/all-work" element={<ArchitectureAllWork />} />
            <Route path="/architecture/project/:id" element={<ArchitectureProjectDetail />} />
            <Route path="/architecture/interior" element={<Interior />} />
            <Route path="/architecture/interior/list" element={<InteriorProjectList />} />
            <Route path="/architecture/collaboration" element={<Collaboration />} />
            <Route path="/architecture/technology" element={<Technology />} />
            <Route path="/architecture/landscape" element={<Landscape />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/architecture/contact" element={<ArchitectureContact />} />
            <Route path="/architecture/inquiry" element={<ArchitectureInquiry />} />
            {/* Add other routes here */}
          </Routes>
        </Layout>
      </Router>
    </ContentProvider>
  );
}

export default App;
