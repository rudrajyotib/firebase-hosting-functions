type RadioProps = {

    name: string,
    values : {key: string, label:string}[],
    onSelect : (selected: string) => void

}

export default RadioProps