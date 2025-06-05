import React from 'react';
import Navbar from '../../layout/Header/Navbar/Navbar';
import useTitle from '../../UseTitle/UseTitle';
import Footer from '../../layout/Footer/Footer';
import HeroSection from '../../components/HeroSection/HeroSection';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import PetCategories from '../../components/PetCategories/PetCategories';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import styles from './Home.module.css';

const Home = () => {
    useTitle();

    return (
        <div className={styles.homePage}>
            <Navbar />
            <main className={styles.mainContent}>
                <HeroSection />
                <PetCategories />
                <FeaturedProducts />
                <WhyChooseUs />
            </main>
            <Footer />
        </div>
    );
}

export default Home;
