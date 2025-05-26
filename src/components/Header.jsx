import { Code } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-center">
        <Code className="h-8 w-8 text-primary-600 mr-2" />
        <h1 className="text-4xl font-bold text-center text-dark-900">
          Git<span className="text-primary-600">SCRUM</span>
        </h1>
      </div>
      <p className="text-center text-dark-500 mt-2 max-w-2xl mx-auto">
        Track and manage your development tasks across projects and sprints
      </p>
    </header>
  );
}
