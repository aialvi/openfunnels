import { Composition, Still } from 'remotion';
import { Demo, DEMO_DURATION } from './Demo';
import { Hero, slides, Social } from './Slides';

export function Root() {
    return (
        <>
            <Composition id="demo" component={Demo} width={1920} height={1080} fps={30} durationInFrames={DEMO_DURATION} />
            <Still id="hero" component={Hero} width={1270} height={760} />
            <Still id="social-preview" component={Social} width={1280} height={640} />
            {Object.entries(slides).map(([id, component]) => (
                <Still key={id} id={id} component={component} width={1270} height={760} />
            ))}
        </>
    );
}
