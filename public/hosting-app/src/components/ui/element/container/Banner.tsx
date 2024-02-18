import BannerProps from "./BannerProps"

const Banner = (props:BannerProps) => {
    return (
        <div style={{display:'flex', flexDirection:'column', flex:1, fontWeight:'bold', marginTop:20, marginBottom:20}}>
            {props.text}
        </div>
    )
}

export default Banner