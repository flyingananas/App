import React from 'react';

interface Props {
  settings: Record<string, string>;
}

export function Cover({ settings }: Props) {
  return (
    <div className="p-6 h-full flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">{settings.project_name || 'Prompt D Project'}</h1>
      <p className="text-gray-500">A Project Companion</p>
      <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <div className="font-bold text-right">Checkpoint Threshold:</div>
        <div>{settings.checkpoint_threshold || '15'}</div>
        <div className="font-bold text-right">System Check Threshold:</div>
        <div>{settings.syc_threshold || '200'}</div>
      </div>
    </div>
  );
}
