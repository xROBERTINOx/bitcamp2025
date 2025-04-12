
import Link from "next/link";

export default function LawyerHomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        AI Lawyer Assistant
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Your legal companion, powered by AI.
      </p>
      <div className="flex flex-col space-y-4">
        <Link
          href="/toss"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
        >
          Terms of Service Simplifier
        </Link>
      </div>
    </div>
  );
}
