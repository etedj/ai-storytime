import React, { useEffect } from 'react';
import './App.css';
import AIStorytime from './components/AIStorytime/AIStorytime';
import Footer from './components/Footer';
import Header from './components/Header';

const App : React.FC = () => {
  return (
    <div className="App">
      <Header />
      <AIStorytime />
      <Footer />
    </div>
  );
}

export default App;
