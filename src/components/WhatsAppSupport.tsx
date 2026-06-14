'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppSupport() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER || '91XXXXXXXXXX';

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-[100] flex items-center gap-2 group"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">Need Help? Chat</span>
    </a>
  );
}
