import BannerProps from "./BannerProps"

const Banner = (props:BannerProps) => {
    return (
        <div style={{display:'flex', flexDirection:'column', flex:1}}>
            {props.text}
        </div>
    )
}

export default Banner