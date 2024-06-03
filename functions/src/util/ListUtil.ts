// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shuffle = (array: any[]) =>{
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};
