import type { ReactNode } from 'react';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#FF7A18] via-[#FF2D55] to-[#7B2FFF] blur-lg opacity-30" aria-hidden />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          <span className="gradient-text">{title}</span>
        </h1>
        {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
