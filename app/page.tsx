
import Link from "next/link";

export default function LawyerHomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        subpoenAI.tech
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
        <Link
          href="/smallcourtclaims"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
        >
          Small Court Claims Preparation
        </Link>
        <Link
          href="/rentingdocs"
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
        >
          Landlord-Tenant Rights Explainer
        </Link>
        <Link
          href="/traffictickets"
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out"
        >
          Traffic Ticket Summarizer
        </Link>
      </div>
    </div>
  );
}    
