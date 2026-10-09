"use client";

import { useActionState, useEffect, useRef } from "react";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { LONGUEUR_MAX_MESSAGE, SUJETS_CONTACT } from "@/lib/contact";
import { envoyerMessageContact, type EtatContact } from "@/app/(public)/contact/actions";

const ETAT_INITIAL: EtatContact = { envoye: false, erreurs: [], valeurs: { nom: "", email: "", sujet: "", message: "" } };
const champ = "rounded-lg border bg-white px-3 py-2";

export function FormulaireContact({ emailParDefaut }: { emailParDefaut?: string }) {
  const [etat, action] = useActionState(envoyerMessageContact, ETAT_INITIAL);
  const retourRef = useRef<HTMLDivElement>(null);

  // Après l'envoi, on place le focus sur le message de confirmation ou
  // d'erreur pour que les lecteurs d'écran l'annoncent.
  useEffect(() => {
    if (etat.envoye || etat.erreurs.length) retourRef.current?.focus();
  }, [etat]);

  if (etat.envoye) {
    return (
      <div ref={retourRef} tabIndex={-1} role="status" className="mt-6 rounded-2xl bg-green-50 p-6 text-green-800">
        <p className="font-semibold">Merci, votre message est bien envoyé !</p>
        <p className="mt-1">Notre équipe vous répond par e-mail, en général sous 48 heures (jours ouvrés).</p>
      </div>
    );
  }

  const v = etat.valeurs;
  return (
    <form action={action} className="mt-6 flex flex-col gap-4" noValidate>
      {etat.erreurs.length > 0 && (
        <div ref={retourRef} tabIndex={-1} role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-red-800">
          <p className="font-semibold">Le message n&apos;est pas parti :</p>
          <ul className="mt-1 list-disc pl-5">
            {etat.erreurs.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-gray-600">Tous les champs sont obligatoires.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          Votre nom
          <input name="nom" required autoComplete="name" defaultValue={v.nom} className={champ} />
        </label>
        <label className="flex flex-col gap-1">
          Votre adresse e-mail
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={v.email || emailParDefaut}
            className={champ}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        Sujet
        <select name="sujet" required defaultValue={v.sujet} className={champ}>
          <option value="" disabled>
            Choisissez un sujet
          </option>
          {SUJETS_CONTACT.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Votre message
        <textarea
          name="message"
          required
          rows={6}
          maxLength={LONGUEUR_MAX_MESSAGE}
          defaultValue={v.message}
          className={champ}
        />
      </label>
      {/* Champ piège pour les robots : invisible et ignoré par les lecteurs d'écran. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Ne pas remplir
          <input name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="text-sm text-gray-600">
        Vos coordonnées servent uniquement à vous répondre. Voir notre{" "}
        <a href="/confidentialite" className="underline">
          politique de confidentialité
        </a>
        .
      </p>
      <BoutonEnvoi
        texteEnCours="Envoi…"
        className="w-fit rounded-full bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
      >
        Envoyer le message
      </BoutonEnvoi>
    </form>
  );
}
