import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10 L90 10 L50 90 Z" fill="orange" stroke="black" strokeWidth="2"/>
        </svg>
    );
}
