import ProviderAuthButtons from "@/components/auth/ProviderAuthButtons";
import EmailPasswordLogin from "@/components/auth/EmailPasswordLogin";
import MagicLinkLogin from "@/components/auth/MagicLinkLogin";
import { Link } from "wouter";

export default function LoginForm() {
  const hasPendingInvite =
    typeof window !== "undefined" && sessionStorage.getItem("pendingInvite") !== null;

  return (
    <div className="flex w-full justify-center">
      <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
        {/* Pending Invitation Notice */}
        {hasPendingInvite && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              <span className="font-semibold">You have a pending co-parent invitation!</span>
              <br />
              Sign in or create an account to accept it.
            </p>
          </div>
        )}

        {/* Headers */}
        <div className="flex flex-col gap-2 text-center">
          <div className="text-neutral-700 text-xl md:text-2xl lg:text-3xl font-semibold">
            Welcome Back
          </div>
          <div className="text-md text-neutral-600">Sign into your LiaiZen account</div>
        </div>

        {/* OAuth Providers */}
        <ProviderAuthButtons />

        {/* OR Divider */}
        <div className="flex w-full items-center gap-3 text-gray-500">
          <div className="w-full h-[1px] bg-gray-500" />
          <span className="text-sm font-medium px-4 py-1 rounded-full">OR</span>
          <div className="w-full h-[1px] bg-gray-500" />
        </div>

        {/* Email/Password Login */}
        {/* <EmailPasswordLogin /> */}

        {/* <div className="flex justify-center w-full">
          <Link href="/reset-password" className="text-sm text-neutral-600 hover:text-blue-500">
            Forgot your password?
          </Link>
        </div> */}

        {/* OR Divider */}
        {/* <div className="flex w-full items-center gap-3 text-gray-500 my-4">
          <div className="w-full h-[1px] bg-gray-300" />
          <span className="text-xs font-medium px-2 py-1 rounded-full">OR</span>
          <div className="w-full h-[1px] bg-gray-300" />
        </div> */}

        {/* Magic Link Login */}
        <MagicLinkLogin />
      </div>
    </div>
  );
}
