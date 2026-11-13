import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white py-8 border-t-4 border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="bg-white px-2.5 py-1.5 rounded-lg shadow-xs shrink-0">
            <img
              src="/assets/aistudio/Asset_8_300x_0_30a573ad.png"
              alt="สถาบันพัฒนาการตรวจเงินแผ่นดิน (SADI)"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div>
            <div className="font-kanit font-semibold text-lg">
              สถาบันพัฒนาการตรวจเงินแผ่นดิน
            </div>
            <p className="text-sm text-gray-400 mt-0.5 font-sarabun">
              สำนักงานการตรวจเงินแผ่นดิน (สตง.)
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-kanit text-center md:text-right">
          &copy; 2026 สำนักงานการตรวจเงินแผ่นดิน. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
