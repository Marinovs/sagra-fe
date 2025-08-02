"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Qualcosa è andato storto
            </h2>
            <p className="text-gray-600 mb-4">
              Si è verificato un errore durante il caricamento di questa
              sezione.
            </p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => this.setState({ hasError: false })}
            >
              Riprova
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
