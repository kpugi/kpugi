import { redirect } from 'next/navigation';

export default function PaymentTermsRedirect() {
  redirect('/escrow-policy');
}
