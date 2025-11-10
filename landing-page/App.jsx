import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import KeyFeatures from './components/KeyFeatures';
import AdvancedStats from './components/AdvancedStats';
import CompetitiveAdvantage from './components/CompetitiveAdvantage';
import TargetSectors from './components/TargetSectors';
import SaudiFrameworks from './components/SaudiFrameworks';
import PlatformDemo from './components/PlatformDemo';
import DashboardPreview from './components/DashboardPreview';
import DemoBooking from './components/DemoBooking';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import FloatingNav from './components/FloatingNav';
import FloatingAIAgent from './components/FloatingAIAgent';
import QuickSectionNav from './components/QuickSectionNav';
import LoginModal from './components/LoginModal';
import { useTheme } from './contexts/ThemeContext';

const App = () => {
  const { theme } = useTheme();

  // Function to redirect to the advanced Glassmorphism login page with Microsoft auth
  const redirectToMainAppLogin = () => {
    // Redirect to the glassmorphism login page with Microsoft authentication
    window.location.href = 'http://localhost:2050/login-glass';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <FloatingNav onLoginClick={redirectToMainAppLogin} />
      <FloatingAIAgent />
      <QuickSectionNav />
      
      <Header onLoginClick={redirectToMainAppLogin} />
      <Hero onLoginClick={redirectToMainAppLogin} />
      <ProblemSolution />
      <KeyFeatures />
      <AdvancedStats />
      <CompetitiveAdvantage />
      <TargetSectors />
      <SaudiFrameworks />
      <PlatformDemo />
      <DashboardPreview />
      <DemoBooking />
      <Testimonials />
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