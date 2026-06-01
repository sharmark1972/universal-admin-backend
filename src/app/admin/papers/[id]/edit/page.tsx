'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPaperRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      router.replace(`/admin/research-papers/new?edit=${params.id}`);
    }
  }, [params.id, router]);

  return null;
}
