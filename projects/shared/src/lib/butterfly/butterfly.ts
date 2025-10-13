import { Component, ViewEncapsulation } from '@angular/core';

/**
 * Butterfly Animation Component
 * 
 * A beautiful animated butterfly created by dazulu.
 * This component displays a 3D butterfly with flapping wings animation.
 * 
 * @component
 * @standalone
 * @example
 * ```html
 * <shared-butterfly></shared-butterfly>
 * ```
 * 
 * @credits
 * Original design by dazulu
 * @link https://codepen.io/dazulu/pen/aOzqvz
 * @link https://bsky.app/profile/did:plc:76lzczubpyga4qfno7mr5vkq
 * @link https://ko-fi.com/dazulu
 */
@Component({
  selector: 'shared-butterfly',
  standalone: true,
  imports: [],
  templateUrl: './butterfly.html',
  styleUrl: './butterfly.scss',
  encapsulation: ViewEncapsulation.None
})
export class Butterfly {
  // *flap* *flap* *flap*
}

