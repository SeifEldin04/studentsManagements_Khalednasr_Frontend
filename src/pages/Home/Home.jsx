import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
// import './Home.css';

const Home = () => {
    // const [circles, setCircles] = useState([]);
    const [scale, setScale] = useState(1);
    const controls = useAnimation();
    const [ref, inView] = useInView();

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        } else {
            controls.start('hidden');
        }
    }, [controls, inView]);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         const scrollY = window.scrollY;
    //         const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    //         const scrollPercentage = scrollY / maxScroll;

    //         // زيادة عدد الدوائر مع السكرول
    //         // const newCircles = Array(Math.floor(scrollPercentage * 100)).fill(0);
    //         // setCircles(newCircles);

    //         // تصغير حجم النص مع السكرول
    //         // const newScale = Math.max(0.5, 1 - scrollPercentage * 0.5);
    //         // setScale(newScale);
    //     };

    //     window.addEventListener('scroll', handleScroll);
    //     return () => window.removeEventListener('scroll', handleScroll);
    // }, []);

    return (
        <>
            <section>
                <header className="flex items-center bg-white dark:bg-black text-black dark:text-white">
                    <div className="header_backgroundContent text-center w-full relative">

                        {/* النص مع حركة السكرول */}
                        <motion.div
                            ref={ref}
                            initial="hidden"
                            animate={controls}
                            variants={{
                                visible: { opacity: 1, y: 0 },
                                hidden: { opacity: 0, y: 50 },
                            }}
                            transition={{ duration: 0.8 }}
                            style={{ transform: `scale(${scale})` }}
                        >
                            <h1 className="text-7xl font-bold">
                                Maths <span className="text-primary">Society</span>
                            </h1>

                            <div className="custom-line mt-6">
                                <span className="diamond1"></span>
                                <div className="line"></div>
                                <span className="diamond2"></span>
                            </div>

                            <div className="text-3xl mt-2">
                                <h2>منصة للاشراف علي طلاب الرياضيات</h2>
                                <h3 className="mt-2">
                                    مع <span className="text-primary">معلم كبير/ خالد نصر</span>
                                </h3>
                            </div>
                        </motion.div>

                        {/* الأسهم المتحركة */}
                        <div className="arrows">
                            <div className="arrow arrow-1"></div>
                            <div className="arrow arrow-2"></div>
                            <div className="arrow arrow-3"></div>
                            <div className="arrow arrow-4"></div>
                        </div>

                    </div>
                </header>
            </section>
        </>
    );
};

export default Home;