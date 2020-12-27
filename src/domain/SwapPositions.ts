export const swapPositions = (array: Array<any>, index: number, destinationIndex: number) => {
    const temp = array[destinationIndex];

    array[destinationIndex] = array[index];
    array[index] = temp;
}