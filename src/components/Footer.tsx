import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white py-8 border-t-4 border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <div className="font-kanit font-semibold text-lg">
            สถาบันพัฒนาการตรวจเงินแผ่นดิน
          </div>
          <p className="text-sm text-gray-400 mt-1 font-sarabun">
            สำนักงานการตรวจเงินแผ่นดิน (สตง.)
          </p>
        </div>
        <div className="text-sm text-gray-400 font-kanit text-center md:text-right">
          &copy; 2026 สำนักงานการตรวจเงินแผ่นดิน. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
