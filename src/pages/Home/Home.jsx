import Navbar from '../../layout/Header/Navbar/Navbar';
import useTitle from '../../UseTitle/UseTitle';
import Footer from '../../layout/Footer/Footer';
import HeroSection from '../../components/HeroSection/HeroSection';
import { Fragment } from 'react';

const Home = () => {
    useTitle();
    return (
        <Fragment>
            <Navbar/>
        <HeroSection/>
        <Footer/>
        </Fragment>
    );
}

export default Home;
