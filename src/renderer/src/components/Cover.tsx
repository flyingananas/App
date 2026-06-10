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
    <div className="p-6 h-full flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">{project.name || 'Prompt D Project'}</h1>
      <p className="text-gray-500 mb-8">A Project Companion</p>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm bg-white p-6 rounded shadow border w-full max-w-md">
        <div className="font-bold text-right text-gray-600">Date:</div>
        <div className="font-medium">{new Date().toLocaleDateString()}</div>

        <div className="font-bold text-right text-gray-600">Mode:</div>
        <div className="font-medium uppercase">{settings.mode || 'NEW'}</div>

        <div className="font-bold text-right text-gray-600">Version:</div>
        <div className="font-medium">v3</div>

        <div className="font-bold text-right text-gray-600 mt-4">Checkpoint Threshold:</div>
        <div className="mt-4 font-medium">{project.checkpoint_threshold || '15'}</div>

        <div className="font-bold text-right text-gray-600">System Check Threshold:</div>
        <div className="font-medium">{project.syc_threshold || '200'}</div>
      </div>
    </div>
  );
}
