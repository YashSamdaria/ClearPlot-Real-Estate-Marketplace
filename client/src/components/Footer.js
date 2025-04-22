import React from 'react';
  
  const Footer = () =>  {
	return (
        <div className="bg-[#0b0c10] text-white  font-sans overflow-hidden">
        {/* Footer */}
      <footer className="text-center text-sm text-gray-400 py-6 border-t border-slate-700">
        © {new Date().getFullYear()} ClearPLOT — All rights reserved.
      </footer>
	  </div>
	);
  }
  
  export default Footer;
  