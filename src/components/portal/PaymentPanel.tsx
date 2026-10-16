"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { getPaymentStatus, startLeasePayment } from "@/lib/actions/payments";
import { formatKes } from "@/lib/payments/balance";
import { Button } from "@/components/ui/Button";
import type { PaymentStatus } from "@/lib/types";
import type { PaymentFormState } from "@/lib/validations";

const initialState: PaymentFormState = { status: "idle" };

const inputClasses =
  "mt-1.5 w-full rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-sm text-charcoal-900 focus:border-burgundy-500 focus:outline-none dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-50";
const labelClasses = "text-sm font-medium text-charcoal-700 dark:text-charcoal-300";
const cardClasses =
  "rounded-2xl border-2 border-gold-500/60 bg-white p-6 shadow-[0_0_18px_-6px_rgba(201,162,39,0.45)] dark:border-gold-400/50 dark:shadow-[0_0_18px_-6px_rgba(212,185,106,0.35)] dark:bg-charcoal-900";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;

export function PaymentPanel({
  token,
  totalDue,
  paid,
  balance,
  extensionCharges,
  tillNumber,
  tillName,
  onlineEnabled,
}: {
  token: string;
  totalDue: number;
  paid: number;
  balance: number;
  extensionCharges: number;
  tillNumber: string;
  tillName: string;
  onlineEnabled: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(startLeasePayment, initialState);
  const [outcome, setOutcome] = useState<{ paymentId: string; status: PaymentStatus | "timeout" } | null>(null);

  const waitingFor = state.status === "sent" ? state.paymentId : null;
  const settled = outcome && outcome.paymentId === waitingFor ? outcome.status : null;

  useEffect(() => {
    if (!waitingFor) return;
    const startedAt = Date.now();
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      const status = await getPaymentStatus(token, waitingFor);
      if (cancelled) return;
      if (status && status !== "pending") {
        setOutcome({ paymentId: waitingFor, status });
        if (status === "paid") router.refresh();
        return;
      }
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setOutcome({ paymentId: waitingFor, status: "timeout" });
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    const first = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(first);
    };
  }, [waitingFor, token, router]);

  const summary = (
    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
      <div>
        <dt className="text-xs text-charcoal-500 dark:text-charcoal-400">Lease cost</dt>
        <dd className="font-medium text-charcoal-900 dark:text-white">{formatKes(totalDue - extensionCharges)}</dd>
      </div>
      <div>
        <dt className="text-xs text-charcoal-500 dark:text-charcoal-400">Extensions</dt>
        <dd className="font-medium text-charcoal-900 dark:text-white">{formatKes(extensionCharges)}</dd>
      </div>
      <div>
        <dt className="text-xs text-charcoal-500 dark:text-charcoal-400">Paid</dt>
        <dd className="font-medium text-charcoal-900 dark:text-white">{formatKes(paid)}</dd>
      </div>
      <div>
        <dt className="text-xs text-charcoal-500 dark:text-charcoal-400">Balance</dt>
        <dd className="font-display text-lg text-burgundy-700 dark:text-burgundy-400">{formatKes(balance)}</dd>
      </div>
    </dl>
  );

  const tillNote = (
    <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
      Payments go to M-Pesa Buy Goods Till <span className="font-semibold">{tillNumber}</span> &middot; {tillName}
    </p>
  );

  if (balance <= 0) {
    return (
      <div className={cardClasses}>
        {summary}
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
          <CheckCircle2 size={18} /> Fully paid — thank you.
        </p>
      </div>
    );
  }

  if (!onlineEnabled) {
    return (
      <div className={cardClasses}>
        {summary}
        <p className="mt-4 text-sm text-charcoal-600 dark:text-charcoal-300">
          Pay via M-Pesa: <span className="font-medium">Lipa na M-Pesa → Buy Goods and Services → Till {tillNumber}</span>{" "}
          ({tillName}), then share the confirmation message with us.
        </p>
      </div>
    );
  }

  if (waitingFor && !settled) {
    return (
      <div className={cardClasses}>
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 flex-shrink-0 animate-spin text-burgundy-600 dark:text-burgundy-400" size={22} />
          <div>
            <p className="font-medium text-charcoal-950 dark:text-white">Check your phone</p>
            <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-300">
              An M-Pesa prompt from {tillName} has been sent. Enter your PIN to complete the payment — this page will
              update automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      {summary}

      {settled === "paid" ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
          <CheckCircle2 size={18} /> Payment received — thank you.
        </p>
      ) : settled === "cancelled" ? (
        <p className="mt-4 text-sm text-burgundy-600">The payment was cancelled on your phone. You can try again.</p>
      ) : settled === "failed" ? (
        <p className="mt-4 text-sm text-burgundy-600">
          The payment didn&apos;t go through (e.g. wrong PIN or insufficient funds). You can try again.
        </p>
      ) : settled === "timeout" ? (
        <p className="mt-4 text-sm text-charcoal-600 dark:text-charcoal-300">
          We haven&apos;t received confirmation yet. If you completed the payment, refresh this page in a few minutes.
        </p>
      ) : null}

      <form action={formAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className={labelClasses}>M-Pesa phone number</label>
          <input type="tel" name="phone" placeholder="0712 345 678" required className={inputClasses} />
        </div>
        <div>
          <label className={labelClasses}>Amount (KES)</label>
          <input
            type="number"
            name="amount"
            min={1}
            max={Math.ceil(balance)}
            step={1}
            defaultValue={Math.ceil(balance)}
            required
            className={inputClasses}
          />
        </div>

        {state.status === "error" ? <p className="text-sm text-burgundy-600 sm:col-span-2">{state.message}</p> : null}

        <div className="flex flex-col gap-3 sm:col-span-2">
          <Button type="submit" disabled={pending} className="self-start">
            <Smartphone size={16} />
            {pending ? "Sending prompt..." : "Pay with M-Pesa"}
          </Button>
          {tillNote}
        </div>
      </form>
    </div>
  );
}
