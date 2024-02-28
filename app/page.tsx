'use client';

import { fabric } from 'fabric';

import Live from '@/components/Live';
import Navbar from '@/components/Navbar';
import RightSideBar from '@/components/RightSideBar';
import { useEffect, useRef, useState } from 'react';
import {
	handleCanvasMouseDown,
	handleResize,
	initializeFabric,
} from '@/lib/canvas';
import LeftSidebar from '@/components/LeftSidebar';
import { ActiveElement } from '@/types/type';

export default function Home() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<fabric.Canvas | null>(null);
	const isDrawing = useRef(false);
	const shapeRef = useRef<fabric.Object | null>(null);
	const selectedShapeRef = useRef<string | null>('rectangle');

	const [activeElement, setActiveElement] = useState<ActiveElement>({
		name: '',
		value: '',
		icon: '',
	});

	const handleActiveElement = (elem: ActiveElement) => {
		setActiveElement(elem);

		selectedShapeRef.current = elem?.value as string;
	};

	useEffect(() => {
		const canvas = initializeFabric({ canvasRef, fabricRef });

		canvas.on('mouse:down', (options) => {
			handleCanvasMouseDown({
				options,
				canvas,
				selectedShapeRef,
				isDrawing,
				shapeRef,
			});
		});

		window.addEventListener('resize', () => {
			handleResize({ canvas: fabricRef.current });
		});
	}, []);

	return (
		<main className='h-screen overflow-hidden'>
			<Navbar
				activeElement={activeElement}
				handleActiveElement={handleActiveElement}
			/>

			<section className='flex h-full flex-row'>
				<LeftSidebar allShapes={[]} />
				<Live canvasRef={canvasRef} />
				<RightSideBar />
			</section>
		</main>
	);
}
