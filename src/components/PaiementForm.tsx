"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

function FormulairePaiement({ bookingId }: { bookingId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function gererSoumission(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setEnCours(true);
    setErreur(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/reservation/${bookingId}/confirmation`,
      },
    });

    if (error) {
      setErreur(error.message ?? "Le paiement a échoué. Merci de réessayer.");
      setEnCours(false);
    }
    // En cas de succès, Stripe redirige automatiquement vers return_url.
  }

  return (
    <form onSubmit={gererSoumission} className="flex flex-col gap-4">
      <PaymentElement />
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}
      <button
        type="submit"
        disabled={!stripe || enCours}
        className="rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {enCours ? "Traitement…" : "Payer"}
      </button>
      <p className="text-xs text-gray-500">
        La caution n&apos;est pas débitée maintenant : votre carte est
        enregistrée et ne sera débitée qu&apos;en cas de dommage constaté à
        l&apos;état des lieux de retour.
      </p>
    </form>
  );
}

export function PaiementForm({ clientSecret, bookingId }: { clientSecret: string; bookingId: string }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <FormulairePaiement bookingId={bookingId} />
    </Elements>
  );
}
