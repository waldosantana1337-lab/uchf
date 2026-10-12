import React, { useState, useRef, useEffect } from 'react';

interface SmartTipProps {
    term: string;
    definition: string;
}

export const SmartTipDisplay: React.FC<SmartTipProps> = ({ term, definition }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setIsOpen(prev => !prev);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
                contentRef.current && !contentRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <span className="relative inline-block">
            <button
                ref={triggerRef}
                onClick={handleToggle}
                className="text-orange-600 border-b border-orange-600 border-dotted font-semibold hover:bg-orange-50 rounded-sm px-1"
                aria-expanded={isOpen}
            >
                {term}
            </button>
            {isOpen && (
                <div
                    ref={contentRef}
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-10 animate-fade-in"
                >
                    <h4 className="font-bold text-[#152238] capitalize">{term}</h4>
                    <p className="text-sm text-[#152238] mt-1">{definition}</p>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45 -mb-1.5"></div>
                </div>
            )}
        </span>
    );
};