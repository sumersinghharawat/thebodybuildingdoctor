import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import '../../../css/oil-calculator.css';
import { initOilCalculator } from './oilCalculator';
import calculatorMarkup from './markup.html?raw';

export default function CalculatorIndex() {
    const rootRef = useRef(null);
    const readyRef = useRef(false);

    useEffect(() => {
        if (!rootRef.current || readyRef.current) {
            return undefined;
        }

        readyRef.current = true;
        rootRef.current.innerHTML = calculatorMarkup;

        const cleanup = initOilCalculator(rootRef.current);

        return () => {
            cleanup?.();
            readyRef.current = false;
            if (rootRef.current) {
                rootRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <AppLayout>
            <Head title="Oil Calculator" />
            <div ref={rootRef} className="oil-calculator" />
        </AppLayout>
    );
}
