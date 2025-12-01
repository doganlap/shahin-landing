import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import KeyFeatures from './components/KeyFeatures';
import CompetitiveAdvantage from './components/CompetitiveAdvantage';
import TargetSectors from './components/TargetSectors';
import SaudiFrameworks from './components/SaudiFrameworks';
import PlatformDemo from './components/PlatformDemo';
import DashboardPreview from './components/DashboardPreview';
import DemoBooking from './components/DemoBooking';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import FloatingNav from './components/FloatingNav';
import FloatingAIAgent from './components/FloatingAIAgent';
import FloatingActionButtons from './components/FloatingActionButtons';
import QuickSectionNav from './components/QuickSectionNav';
import LoginModal from './components/LoginModal';
import { useTheme } from './contexts/ThemeContext';

const App = () => {
  const { theme } = useTheme();
  const [isDemoOpen, setIsDemoOpen] = React.useState(false);

  // Function to redirect to the advanced Glassmorphism login page with Microsoft auth
  const redirectToMainAppLogin = () => {
    // Redirect to the glassmorphism login page with Microsoft authentication
    window.location.href = 'http://65.108.37.204:8000';
  };

  // Function to open demo booking
  const handleDemoClick = () => {
    const demoSection = document.getElementById('demo-booking');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setIsDemoOpen(true);
  };

  // Function to handle POC request
  const handlePOCClick = () => {
    const demoSection = document.getElementById('demo-booking');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setIsDemoOpen(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <FloatingNav onLoginClick={redirectToMainAppLogin} />
      <FloatingAIAgent />
      <FloatingActionButtons
        onLoginClick={redirectToMainAppLogin}
        onDemoClick={handleDemoClick}
        onPOCClick={handlePOCClick}
      />
      <QuickSectionNav />

      <Header onLoginClick={redirectToMainAppLogin} />
      <Hero onLoginClick={redirectToMainAppLogin} />
      <ProblemSolution />
      <KeyFeatures />
      <CompetitiveAdvantage />
      <TargetSectors />
      <SaudiFrameworks />
      <PlatformDemo />
      <DashboardPreview />
      <DemoBooking />
      <FAQ />
      <FinalCTA onLoginClick={redirectToMainAppLogin} />
      <Footer />

      <LoginModal
        isOpen={false}
        onClose={() => {}}
        onLoginRedirect={redirectToMainAppLogin}
      />
    </div>
  );
};

export default App;