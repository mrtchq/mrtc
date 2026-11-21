// All GSAP imports in this app must come from this module.
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, SplitText, DrawSVGPlugin, ScrambleTextPlugin);

export { gsap, SplitText, DrawSVGPlugin, ScrambleTextPlugin, useGSAP };
