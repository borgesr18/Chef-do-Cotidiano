//components/Header.tsx
export default function Header() {
  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Culinária para Homens</h1>
        <nav className="space-x-4">
          <a href="/" className="hover:underline">Home</a>
          <a href="/receitas" className="hover:underline">Receitas</a>
          <a href="/cursos" className="hover:underline">Cursos</a>
          <a href="/sobre" className="hover:underline">Sobre</a>
          <a href="/contato" className="hover:underline">Contato</a>
        </nav>
      </div>
    </header>
  );
}
