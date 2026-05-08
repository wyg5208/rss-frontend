"use client";

import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center text-gray-500">
          <p>组件加载失败</p>
          <button onClick={() => this.setState({ hasError: false })} className="text-blue-600 text-sm mt-2">
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
