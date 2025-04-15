import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowLeft } from 'lucide-react';

export type LoadingState = 'collecting' | 'outlining';

interface SearchLoadingAnimationProps {
  loadingState: LoadingState;
  onCancel: () => void;
}

const funFacts = [
  "Light takes 8 minutes and 20 seconds to travel from the Sun to Earth.",
  "Your brain generates about 20 watts of power—enough to power a dim light bulb!",
  "A teaspoon of a neutron star weighs about 6 billion tons.",
  "Water can boil and freeze at the same time under special conditions.",
  "Octopuses have three hearts and blue blood.",
  "Time moves slower in stronger gravitational fields—a concept known as time dilation.",
  "The human body contains around 37.2 trillion cells.",
  "A day on Venus is longer than a year on Venus."
];

const SearchLoadingAnimation: React.FC<SearchLoadingAnimationProps> = ({ loadingState, onCancel }) => {
  const [currentFact, setCurrentFact] = useState(funFacts[0]);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    }, 3000);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(factInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  const getLoadingText = () => {
    switch (loadingState) {
      case 'collecting':
        return `Collecting Sources${dots}`;
      case 'outlining':
        return `Generating Outline${dots}`;
      default:
        return 'Loading...';
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <div className="relative min-h-screen bg-[#F0F0F0] transition-colors duration-300">
      <button 
        onClick={handleBackClick}
        className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors z-50 cursor-pointer"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-3xl space-y-16">
          <div className="relative">
            <div className="w-full h-16 pl-14 pr-16 text-xl flex items-center bg-white rounded-lg border border-[#CCCCCC] font-quicksand">
              <Search className="absolute left-4 w-6 h-6 text-gray-400" />
              <span className="font-quicksand text-gray-600">
                {getLoadingText()}
              </span>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white text-gray-600 rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === 0 ? 'bg-gray-800' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="bg-white border border-[#CCCCCC] rounded-lg p-8">
            <div className="mb-4">
              <span className="text-gray-500 uppercase tracking-wider text-sm font-medium font-quicksand">
                Fun Fact
              </span>
            </div>
            <p className="text-gray-600 text-lg font-light leading-relaxed transition-all duration-500 ease-in-out font-quicksand">
              {currentFact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchLoadingAnimation;