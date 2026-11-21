import { redirect } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import PreboardingFlow from "./PreboardingFlow";

export const instant = false;

async function completePreboarding(formData) {
  "use server";

  const firstName = formData.get("firstName");
  const defaultColorId = formData.get("defaultColorId");
  const defaultColorValue = formData.get("defaultColorValue");

  if (
    typeof firstName !== "string"
    || firstName.trim().length === 0
    || typeof defaultColorId !== "string"
    || typeof defaultColorValue !== "string"
  ) {
    redirect("/preboarding?error=true");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError?.name === "AuthSessionMissingError") {
    redirect("/login");
  }

  if (userError) {
    throw userError;
  }

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: firstName.trim(),
      display_name: firstName.trim(),
      onboarding_complete: true,
      default_note_color: defaultColorId,
      default_note_color_value: defaultColorValue,
    },
  });

  if (error) {
    redirect("/preboarding?error=true");
  }

  redirect("/");
}

export default async function PreboardingPage({ searchParams }) {
  const { error: completionError, fromLogin } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.user_metadata?.onboarding_complete === true) {
    redirect("/");
  }

  return (
    <PreboardingFlow
      fromLogin={fromLogin === "true"}
      completionError={Boolean(completionError)}
      completePreboarding={completePreboarding}
    />
  );
}
