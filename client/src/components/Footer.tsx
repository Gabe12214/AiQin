import React from 'react';
import { Wallet, FileText, HelpCircle } from 'lucide-react';
import { SiGithub } from 'react-icons/si';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold">AIQin</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Your trusted gateway to blockchain</p>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                <span>Docs</span>
              </div>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <div className="flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                <span>Support</span>
              </div>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <div className="flex items-center">
                <SiGithub className="h-4 w-4 mr-1" />
                <span>GitHub</span>
              </div>
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} AIQin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
