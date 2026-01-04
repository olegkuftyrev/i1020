import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to i1020</h1>
        <p className="text-muted-foreground text-lg">
          Get started by signing in or creating an account
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth">
            <Button>Sign In / Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
