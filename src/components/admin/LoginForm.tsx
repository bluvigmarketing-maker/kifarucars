"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/admin-auth";
import { Button } from "@/components/ui/Button";
import type { LoginFormState } from "@/lib/validations";

const initialState: LoginFormState = { status: "idle" };

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const message = state.status === "error" ? state.message : initialError;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-charcoal-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1.5 w-full rounded-lg border border-charcoal-200 px-4 py-2.5 text-sm focus:border-burgundy-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-charcoal-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1.5 w-full rounded-lg border border-charcoal-200 px-4 py-2.5 text-sm focus:border-burgundy-500 focus:outline-none"
        />
      </div>

      {message ? <p className="text-sm text-burgundy-600">{message}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
