'use client';

export default function TestingModeBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 text-center">
      <p className="text-amber-800 text-sm font-bold">
        🚀 <span className="uppercase tracking-widest text-[10px] bg-amber-200 px-2 py-0.5 rounded mr-2">Beta Testing Mode</span>
        All features are temporarily unlocked while we collect feedback and improve report quality.
      </p>
    </div>
  );
}
