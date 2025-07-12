//admin/alunos/[id]/page.tsx

{/* Histórico de notificações */}
<section className="mt-10">
  <h2 className="text-xl font-semibold mb-2">📨 Notificações Enviadas</h2>
  <div className="space-y-3">
    {aluno.notificacoes?.map((n) => (
      <div key={n.id} className="border rounded p-4 bg-gray-50">
        <p className="text-sm text-gray-500">{new Date(n.criadoEm).toLocaleString()}</p>
        <p className="font-semibold">{n.titulo}</p>
        <p>{n.mensagem}</p>
        <p className="text-xs text-blue-600">Canal: {n.canal.toUpperCase()}</p>
      </div>
    ))}
  </div>
</section>
