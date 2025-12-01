import React from 'react';
import { twMerge } from 'tailwind-merge';

interface LayoutProps {
	children: React.ReactNode;
	className?: string;
	bottomBar?: React.ReactNode;
}

export function Layout({ children, className, bottomBar }: LayoutProps) {
	return (
		<div className="flex flex-col h-screen w-full text-white">
			{/* Main Content Area */}
			<main className={twMerge('flex-1 overflow-hidden relative', className)}>
				<div className="absolute inset-0 overflow-y-auto p-6">{children}</div>
			</main>

			{/* Bottom Player Bar Area */}
			{bottomBar && (
				<div className="h-24 shrink-0 z-50 glass border-t border-white/10">
					{bottomBar}
				</div>
			)}
		</div>
	);
}
