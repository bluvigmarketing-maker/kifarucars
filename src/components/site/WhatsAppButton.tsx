import { BUSINESS } from "@/lib/placeholder-data";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${BUSINESS.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7">
        <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.34.68 4.52 1.86 6.36L4 29l7.84-1.8a11.9 11.9 0 0 0 4.18.76h.02C22.62 27.96 28 22.58 28 15.96 28 9.34 22.64 3 16.02 3Zm0 21.6h-.02a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.86.89.9-3.76-.24-.38a9.83 9.83 0 0 1-1.5-5.23c0-5.46 4.46-9.9 9.94-9.9 2.65 0 5.14 1.03 7.02 2.9a9.83 9.83 0 0 1 2.91 7.01c0 5.46-4.47 9.9-9.94 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.29-.77.97-.94 1.17-.17.2-.35.22-.65.07-1.76-.88-2.9-1.57-4.06-3.56-.31-.53.31-.49.88-1.63.1-.2.05-.37-.05-.52-.1-.15-.66-1.6-.9-2.19-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.48 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.36 2.53.99 3.05.8 3.6.75.55-.05 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.19-.57-.34Z" />
      </svg>
    </a>
  );
}
