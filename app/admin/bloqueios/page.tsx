//app/admin/bloqueios/page.tsx

<button
  className="text-red-600 hover:underline"
  onClick={async () => {
    await supabase
      .from('ip_bloqueado')
      .delete()
      .eq('id', bloqueio.id);
    router.refresh();
  }}
>
  Desbloquear
</button>
