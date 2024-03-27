
import manifest from './sprite-sheet/manifest.json';
import sprite from './sprite-sheet/gen.png';

/**
 * @typedef {Object} Icon
 * @property {string} url
 * @property {number} x 
 * @property {number} y
 * @property {number} width
 * @property {number} height

 */

/**
 * 
 * @param {keyof typeof manifest} iconName 
 * @return {Icon}
 */
export const getIcon = (iconName) => {
    const iconDimensions = manifest[iconName];
    return {
        url: sprite,
        ...iconDimensions
    };
};
