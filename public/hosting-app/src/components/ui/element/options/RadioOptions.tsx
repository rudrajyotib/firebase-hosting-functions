import { ChangeEvent, ChangeEventHandler, useState } from "react"
import RadioProps from "./RadioProps"


const RadioOptions = (props:RadioProps) => {

    const [checked, setChecked] = useState('');

    const selectFunction :  ChangeEventHandler<HTMLInputElement> = (event: ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value)
        setChecked(event.target.value)
    }
    return (
        <div>
            {
                props.values.map((option, index) => <div key={`radioOption${props.name}${index}`}>
                    <input type='radio' 
                        name={props.name} 
                        id={option.key} 
                        key={`radioKey${props.name}${index}`} 
                        value={option.key} 
                        onChange={selectFunction}
                        checked={checked===option.key}/>
                    <span key={`radioLabel${props.name}${index}`}>{option.label}</span>
                </div>)
            }
        </div>
    )

}

export default RadioOptions