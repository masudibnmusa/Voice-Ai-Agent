import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] md:w-[350px] shadow-xl flex flex-col overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[32px] w-[120px] bg-black rounded-b-[1rem] z-20 flex justify-center items-center">
             <div className="h-2 w-16 bg-gray-800 rounded-full opacity-50"></div>
        </div>
        
        {/* Screen Content */}
        <div className="h-[32px] bg-gray-900 w-full shrink-0"></div> {/* Status Bar Mock */}
        <div className="flex-1 bg-[#0b141a] overflow-hidden relative w-full flex flex-col">
            {children}
        </div>
        
        {/* Home Indicator */}
        <div className="h-[20px] bg-gray-900 w-full flex justify-center items-center shrink-0">
             <div className="h-1 w-32 bg-gray-600 rounded-full"></div>
        </div>
    </div>
  );
};

export default PhoneFrame;