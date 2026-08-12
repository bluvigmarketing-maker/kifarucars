"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { submitEnquiry } from "@/lib/actions/enquiry";
import type { EnquiryFormState } from "@/lib/validations";

const initialState: EnquiryFormState = { status: "idle" };

const inputClasses =
  "w-full rounded-lg border-2 border-gold-400/45 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-charcoal-400 focus:border-burgundy-400 focus:outline-none";

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);

  return (
    <section id="enquiry" className="bg-charcoal-950 py-20 text-white sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Make An Enquiry</h2>
            <p className="mt-4 max-w-md text-charcoal-300">
              For any car rent enquiries or requests please fill out the
              following form and we&rsquo;ll get back to you as soon as
              possible. Alternatively contact us directly via telephone or
              mobile.
            </p>
          </div>

          <div>
            {state.status === "success" ? (
              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-6">
                <CheckCircle2 className="mt-0.5 flex-shrink-0 text-burgundy-400" size={22} />
                <div>
                  <p className="font-semibold">Thanks — your enquiry has been sent.</p>
                  <p className="mt-1 text-sm text-charcoal-300">
                    Our team will get back to you shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input name="firstName" placeholder="First Name*" required className={inputClasses} />
                  {state.status === "error" && state.errors.firstName ? (
                    <p className="mt-1 text-xs text-burgundy-300">{state.errors.firstName[0]}</p>
                  ) : null}
                </div>
                <div>
                  <input name="lastName" placeholder="Last Name*" required className={inputClasses} />
                  {state.status === "error" && state.errors.lastName ? (
                    <p className="mt-1 text-xs text-burgundy-300">{state.errors.lastName[0]}</p>
                  ) : null}
                </div>
                <div>
                  <input type="email" name="email" placeholder="Email*" required className={inputClasses} />
                  {state.status === "error" && state.errors.email ? (
                    <p className="mt-1 text-xs text-burgundy-300">{state.errors.email[0]}</p>
                  ) : null}
                </div>
                <div>
                  <input type="tel" name="phone" placeholder="Phone*" required className={inputClasses} />
                  {state.status === "error" && state.errors.phone ? (
                    <p className="mt-1 text-xs text-burgundy-300">{state.errors.phone[0]}</p>
                  ) : null}
                </div>
                <select name="hearAboutUs" defaultValue="" className={`${inputClasses} sm:col-span-2`}>
                  <option value="" disabled>
                    How did you hear about us?
                  </option>
                  <option value="google">Google Search</option>
                  <option value="referral">Referral</option>
                  <option value="social">Social Media</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  name="message"
                  placeholder="Additional information"
                  rows={4}
                  className={`${inputClasses} sm:col-span-2`}
                />

                {state.status === "error" && state.message ? (
                  <p className="text-sm text-burgundy-300 sm:col-span-2">{state.message}</p>
                ) : null}

                <label className="flex items-start gap-2 text-xs text-charcoal-400 sm:col-span-2">
                  <input type="checkbox" required className="mt-0.5" />
                  By using this form you agree with the storage and handling
                  of your data by this website.
                </label>

                <Button type="submit" disabled={pending} className="sm:col-span-2">
                  {pending ? "Sending..." : "Submit"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
