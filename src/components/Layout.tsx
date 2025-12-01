import React from 'react';
import { twMerge } from 'tailwind-merge';
import { PlaylistSidebar } from './PlaylistSidebar';

interface LayoutProps {
	children: React.ReactNode;
	className?: string;
	bottomBar?: React.ReactNode;
}

export function Layout({ children, className, bottomBar }: LayoutProps) {
	return (
		<div className="flex h-screen w-full text-white bg-black">
			{/* Left Sidebar */}
			<div className="w-64 shrink-0 glass border-r border-white/10">
				<PlaylistSidebar />
			</div>

			<div className="flex flex-1 flex-col overflow-hidden">
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
		</div>
	);
}
