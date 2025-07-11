//app/admin/page.tsx — Página inicial do Painel Administrativo
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const router = useRouter();
  const [tipo, setTipo] = useState<string | null>(null);

  useEffect(() => {
    const verificarAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: perfil } = await supabase
        .from('perfis_usuarios')
        .select('tipo')
        .eq('user_id', user.id)
        .single();

      if (perfil?.tipo !== 'admin') return router.push('/');
      setTipo('admin');
    };
    verificarAdmin();
  }, [router]);

  if (tipo !== 'admin') return <p className="p-8">Verificando permissões...</p>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Painel Administrativo</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          className="bg-blue-600 text-white rounded p-6 text-left hover:bg-blue-700"
          onClick={() => router.push('/admin/cursos')}
        >
          <h2 className="text-xl font-semibold">🎓 Gerenciar Cursos</h2>
          <p className="text-sm mt-1">Crie, edite e remova cursos disponíveis</p>
        </button>

        <button
          className="bg-green-600 text-white rounded p-6 text-left hover:bg-green-700"
          onClick={() => router.push('/admin/alunos')}
        >
          <h2 className="text-xl font-semibold">👨‍🎓 Gerenciar Alunos</h2>
          <p className="text-sm mt-1">Visualize perfis, progresso e promoções</p>
        </button>

        <button
          className="bg-purple-600 text-white rounded p-6 text-left hover:bg-purple-700"
          onClick={() => router.push('/admin/certificados')}
        >
          <h2 className="text-xl font-semibold">📄 Certificados Emitidos</h2>
          <p className="text-sm mt-1">Consulte e valide emissões públicas</p>
        </button>

        <button
          className="bg-gray-800 text-white rounded p-6 text-left hover:bg-gray-900"
          onClick={() => router.push('/admin/auditoria')}
        >
          <h2 className="text-xl font-semibold">🕵️ Auditoria de Certificados</h2>
          <p className="text-sm mt-1">Histórico de acessos verificados</p>
        </button>
      </div>
    </div>
  );
}

