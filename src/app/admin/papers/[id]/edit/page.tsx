import { redirect } from 'next/navigation';

export default function EditPaperRedirect() {
  redirect('/admin/papers');
}
