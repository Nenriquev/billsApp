import { Link } from "react-router-dom"
import { HomeWrapper } from "./Home.styles"


const Home = () => {
  return (
    <HomeWrapper>
      <h1>HOME</h1>
      <Link to={'/upload'}>SUBIR ARCHIVO</Link>
    </HomeWrapper>
  )
}

export default Home