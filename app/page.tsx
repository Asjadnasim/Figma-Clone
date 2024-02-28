'use client';

import { fabric } from 'fabric';

import Live from '@/components/Live';
import Navbar from '@/components/Navbar';
import RightSideBar from '@/components/RightSideBar';
import { useEffect, useRef, useState } from 'react';
import {
	handleCanvasMouseDown,
	handleCanvasMouseUp,
	handleCanvasObjectModified,
	handleCanvaseMouseMove,
	handleResize,
	initializeFabric,
	renderCanvas,
} from '@/lib/canvas';
import LeftSidebar from '@/components/LeftSidebar';
import { ActiveElement } from '@/types/type';
import { useMutation, useRedo, useStorage, useUndo } from '@/liveblocks.config';
import { defaultNavElement, navElements } from '@/constants';
import { handleDelete, handleKeyDown } from '@/lib/key-events';

export default function Home() {
	const undo = useUndo();
	const redo = useRedo();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<fabric.Canvas | null>(null);
	const isDrawing = useRef(false);
	const shapeRef = useRef<fabric.Object | null>(null);
	const selectedShapeRef = useRef<string | null>(null);
	const activeObjectRef = useRef<fabric.Object | null>(null);

	const canvasObjects = useStorage((root) => root.canvasObjects);

	const deleteAllShapes = useMutation(({ storage }) => {
		const canvasObjects = storage.get('canvasObjects');

		if (!canvasObjects || canvasObjects.size === 0) return true;

		for (const [key, value] of canvasObjects.entries()) {
			canvasObjects.delete(key);
		}

		return canvasObjects.size === 0;
	}, []);

	const deleteShapeFromStorage = useMutation(({ storage }, objectId) => {
		const canvasObjects = storage.get('canvasObjects');

		canvasObjects.delete(objectId);
	}, []);

	const syncShapeInStorage = useMutation(({ storage }, object) => {
		if (!object) return;

		const { objectId } = object;

		const shapeData = object.toJSON();
		shapeData.objectId = objectId;

		const canvasObject = storage.get('canvasObjects');

		canvasObject.set(objectId, shapeData);
	}, []);

	const [activeElement, setActiveElement] = useState<ActiveElement>({
		name: '',
		value: '',
		icon: '',
	});

	const handleActiveElement = (elem: ActiveElement) => {
		setActiveElement(elem);

		switch (elem?.value) {
			case 'reset':
				deleteAllShapes();
				fabricRef.current?.clear();
				setActiveElement(defaultNavElement);
				break;

			case 'delete':
				handleDelete(fabricRef.current as any, deleteShapeFromStorage);
				setActiveElement(defaultNavElement);

			default:
				break;
		}

		selectedShapeRef.current = elem?.value as string;
	};

	useEffect(() => {
		const canvas = initializeFabric({ canvasRef, fabricRef });

		canvas.on('mouse:down', (options: any) => {
			handleCanvasMouseDown({
				options,
				canvas,
				selectedShapeRef,
				isDrawing,
				shapeRef,
			});
		});

		canvas.on('mouse:move', (options: any) => {
			handleCanvaseMouseMove({
				options,
				canvas,
				selectedShapeRef,
				isDrawing,
				shapeRef,
				syncShapeInStorage,
			});
		});

		canvas.on('mouse:up', () => {
			handleCanvasMouseUp({
				canvas,
				selectedShapeRef,
				isDrawing,
				shapeRef,
				syncShapeInStorage,
				setActiveElement,
				activeObjectRef,
			});
		});

		canvas.on('object:modified', (options: any) => {
			handleCanvasObjectModified({
				options,
				syncShapeInStorage,
			});
		});

		window.addEventListener('resize', () => {
			handleResize({ canvas: fabricRef.current });
		});

		window.addEventListener('keydown', (e: any) => {
			handleKeyDown({
				e,
				canvas: fabricRef,
				undo,
				redo,
				syncShapeInStorage,
				deleteShapeFromStorage,
			});
		});

		return () => {
			canvas.dispose();
		};
	}, []);

	useEffect(() => {
		renderCanvas({
			fabricRef,
			canvasObjects,
			activeObjectRef,
		});
	}, [canvasObjects]);

	return (
		<main className='h-screen overflow-hidden'>
			<Navbar
				activeElement={activeElement}
				handleActiveElement={handleActiveElement}
			/>

			<section className='flex h-full flex-row'>
				<LeftSidebar allShapes={Array.from(canvasObjects)} />
				<Live canvasRef={canvasRef} />
				<RightSideBar />
			</section>
		</main>
	);
}
