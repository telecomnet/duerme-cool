const WHATSAPP_URL =
  'https://wa.me/526862397665?text=Hola%2C%20tengo%20una%20duda%20sobre%20Duerme.cool';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir chat de WhatsApp"
      title="Escribenos por WhatsApp"
      className="fixed right-5 bottom-28 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-900/20 ring-1 ring-white/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 sm:right-6 sm:bottom-32"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8"
        fill="currentColor"
      >
        <path d="M16.03 4C9.42 4 4.05 9.35 4.05 15.92c0 2.1.55 4.15 1.6 5.95L4 28l6.3-1.64a12 12 0 0 0 5.72 1.46h.01C22.64 27.82 28 22.48 28 15.9 28 9.35 22.64 4 16.03 4Zm0 21.8h-.01c-1.78 0-3.52-.48-5.04-1.38l-.36-.21-3.74.97 1-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.26c0-5.45 4.45-9.89 9.92-9.89 2.65 0 5.14 1.03 7.01 2.9a9.78 9.78 0 0 1 2.9 6.98c0 5.45-4.45 9.89-9.92 9.89Zm5.43-7.41c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47a8.95 8.95 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.12 3.22 5.13 4.51.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
