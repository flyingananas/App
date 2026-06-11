import React from 'react';

interface Props {
  settings: Record<string, string>;
  project: any;
}

export function Cover({ settings, project }: Props) {
  if (!project) {
    return <div className="p-6 text-gray-500 text-center mt-20">Loading cover...</div>;
  }

  return (
    <div className="p-6 h-full flex flex-col justify-center items-center bg-slate-50">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 mb-3">{project.name || 'Prompt D Project'}</h1>
        <p className="text-lg text-slate-500 font-medium tracking-wide uppercase">A Project Companion</p>
      </div>

      <div className="card p-8 w-full max-w-md">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
          <div className="font-semibold text-right text-slate-500">Date</div>
          <div className="font-medium text-slate-800">{new Date().toLocaleDateString()}</div>

          <div className="font-semibold text-right text-slate-500">Mode</div>
          <div className="font-medium text-slate-800 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded inline-block w-max">{settings.mode || 'NEW'}</div>

          <div className="font-semibold text-right text-slate-500">Version</div>
          <div className="font-medium text-slate-800 font-mono">v3</div>

          <div className="col-span-2 border-t border-slate-100 my-2"></div>

          <div className="font-semibold text-right text-slate-500">Checkpoint Threshold</div>
          <div className="font-medium text-slate-800">{project.checkpoint_threshold || '15'} <span className="text-slate-400 font-normal">items</span></div>

          <div className="font-semibold text-right text-slate-500">System Check Threshold</div>
          <div className="font-medium text-slate-800">{project.syc_threshold || '200'} <span className="text-slate-400 font-normal">items</span></div>
        </div>
      </div>
    </div>
  );
}
