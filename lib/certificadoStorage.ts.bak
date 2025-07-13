//lib/certificadoStorage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Service Role Key necessária para upload
);

export async function uploadCertificadoPDF(file: Blob, nomeArquivo: string) {
  const { data, error } = await supabase.storage
    .from('certificados')
    .upload(`pdfs/${nomeArquivo}`, file, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (error) throw new Error('Erro ao enviar PDF para o Storage');

  const { data: publicUrlData } = supabase.storage
    .from('certificados')
    .getPublicUrl(`pdfs/${nomeArquivo}`);

  return publicUrlData.publicUrl;
}
