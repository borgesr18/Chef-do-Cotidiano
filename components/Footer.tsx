//components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-black text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Rodrigo Borges. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
