
import React from 'react';

const suggestions = [
  'Generate a 3D model render',
  'Create a photorealistic night render',
  'Show the architectural floor plans',
  'Generate conceptual design sketches',
  'Create an elevation drawing',
  'Add a retro filter',
  'Render in a brutalist style',
];

interface PromptSuggestionsProps {
    onSelectPrompt: (prompt: string) => void;
    disabled: boolean;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt, disabled }) => {
  return (
    <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-400">Or try a suggestion:</h3>
        <div className="flex flex-wrap gap-2">
            {suggestions.map((prompt) => (
                <button
                    key={prompt}
                    onClick={() => onSelectPrompt(prompt)}
                    disabled={disabled}
                    className="px-3 py-1 bg-gray-600 text-gray-200 text-sm rounded-full hover:bg-cyan-500 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {prompt}
                </button>
            ))}
        </div>
    </div>
  );
};
