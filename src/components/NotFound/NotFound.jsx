import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPaw, FaHome, FaShoppingBag } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import styles from "./NotFound.module.css";

const NotFound = () => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [petPosition, setPetPosition] = useState({ x: 50, y: 50 });
  const [petMood, setPetMood] = useState("idle"); // idle, curious, happy, playing
  const [showBubble, setShowBubble] = useState(false);
  const [pawPrints, setPawPrints] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const containerRef = useRef(null);
  const petRef = useRef(null);
  const isPetting = useRef(false);
  const idleTimeout = useRef(null);
  const moveInterval = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
    if (petMood !== "happy" && petMood !== "playing") {
      setPetMood("curious");
      clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(() => {
        setPetMood("idle");
      }, 3000);
    }
  };
  const handlePetClick = () => {
    if (petMood === "happy") {
      setPetMood("playing");
      createConfetti();
    } else {
      setPetMood("happy");
    }

    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 2000);

    createPawPrint(petPosition.x, petPosition.y);
  };
  const createConfetti = () => {
    const newConfetti = [];
    for (let i = 0; i < 30; i++) {
      newConfetti.push({
        id: Date.now() + i,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 10,
        size: 5 + Math.random() * 10,
        color: `hsl(${Math.random() * 60 + 260}, ${80 + Math.random() * 20}%, ${
          50 + Math.random() * 20
        }%)`,
        rotation: Math.random() * 360,
        duration: 1 + Math.random(),
      });
    }
    setConfetti((prev) => [...prev, ...newConfetti]);

    setTimeout(() => {
      setConfetti((prev) =>
        prev.filter((c) => !newConfetti.find((nc) => nc.id === c.id))
      );
    }, 3000);
  };

  const createPawPrint = (x, y) => {
    const newPawPrint = {
      id: Date.now(),
      x: x - 5 + Math.random() * 10,
      y: y - 5 + Math.random() * 10,
      rotation: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.4,
      opacity: 0.8,
    };

    setPawPrints((prev) => [...prev, newPawPrint]);
    setTimeout(() => {
      setPawPrints((prev) => prev.filter((p) => p.id !== newPawPrint.id));
    }, 5000);
  };

  useEffect(() => {
    moveInterval.current = setInterval(() => {
      if (petMood === "idle") {
        const newX = Math.max(
          10,
          Math.min(90, petPosition.x + (Math.random() - 0.5) * 10)
        );
        const newY = Math.max(
          30,
          Math.min(70, petPosition.y + (Math.random() - 0.5) * 8)
        );

        setPetPosition({ x: newX, y: newY });
        createPawPrint(newX, newY);
      }
    }, 3000);

    if (petMood === "curious") {
      const dx = mousePosition.x - petPosition.x;
      const dy = mousePosition.y - petPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        const speed = 0.05;
        const newX = petPosition.x + dx * speed;
        const newY = petPosition.y + dy * speed;

        setPetPosition({
          x: Math.max(10, Math.min(90, newX)),
          y: Math.max(30, Math.min(70, newY)),
        });

        if (Math.random() > 0.7) {
          createPawPrint(petPosition.x, petPosition.y);
        }
      }
    }

    return () => {
      clearInterval(moveInterval.current);
      clearTimeout(idleTimeout.current);
    };
  }, [petMood, petPosition, mousePosition]);

  return (
    <div
      ref={containerRef}
      className={styles.notFoundContainer}
      onMouseMove={handleMouseMove}
    >
      {" "}
      <div className={styles.background}>
        <div className={styles.stars}></div>
        <div className={styles.clouds}></div>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.errorCode}>
          <span className={`${styles.digit} ${styles.bounce1}`}>4</span>
          <div
            className={styles.pawContainer}
            onClick={handlePetClick}
            ref={petRef}
          >
            {pawPrints.map((print) => (
              <FaPaw
                key={print.id}
                className={styles.pawPrint}
                style={{
                  left: `${print.x}%`,
                  top: `${print.y}%`,
                  transform: `rotate(${print.rotation}deg) scale(${print.scale})`,
                  opacity: print.opacity,
                }}
              />
            ))}
            <FaPaw className={`${styles.pawIcon} ${styles[petMood]}`} />
            <div
              className={`${styles.pet} ${styles[petMood]}`}
              style={{
                left: `${petPosition.x}%`,
                top: `${petPosition.y}%`,
              }}
            >
              {showBubble && (
                <div className={styles.speechBubble}>
                  <span>{petMood === "happy" ? "Meow! ♥" : "Purr~"}</span>
                </div>
              )}
              <div className={`${styles.petEars} ${styles[`ears-${petMood}`]}`}>
                <div className={styles.ear}></div>
                <div className={styles.ear}></div>
              </div>
              <div className={`${styles.petFace} ${styles[`face-${petMood}`]}`}>
                <div className={styles.petEyes}>
                  <div
                    className={`${styles.eye} ${styles[`eye-${petMood}`]}`}
                  ></div>
                  <div
                    className={`${styles.eye} ${styles[`eye-${petMood}`]}`}
                  ></div>
                </div>
                <div className={styles.petNose}></div>
                <div
                  className={`${styles.petMouth} ${styles[`mouth-${petMood}`]}`}
                ></div>
                <div className={styles.petWhiskers}>
                  <div className={styles.whisker}></div>
                  <div className={styles.whisker}></div>
                  <div className={styles.whisker}></div>
                  <div className={styles.whisker}></div>
                </div>
              </div>
              <div
                className={`${styles.petTail} ${styles[`tail-${petMood}`]}`}
              ></div>
            </div>
            {confetti.map((item) => (
              <div
                key={item.id}
                className={styles.confetti}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${item.size}px`,
                  height: `${item.size}px`,
                  backgroundColor: item.color,
                  transform: `rotate(${item.rotation}deg)`,
                  animationDuration: `${item.duration}s`,
                }}
              />
            ))}
          </div>

          <span className={`${styles.digit} ${styles.bounce2}`}>4</span>
        </div>

        <h1 className={styles.title}>
          {t("notFound.title") || "Oops! Deyəsən yolunuzu azmısınız"}
        </h1>
        <p className={styles.description}>
          {t("notFound.description") ||
            "Axradığınız səhifə mövcud deyil. Bəlkə dostumuz onu yeyib?"}
        </p>

        {/* Random paw trail */}
        <div className={styles.randomPawTrail}>
          {[...Array(10)].map((_, i) => (
            <FaPaw
              key={i}
              className={`${styles.trailPaw} ${styles[`paw-${i % 4}`]}`}
              style={{
                left: `${i * 10}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <div className={styles.buttonsContainer}>
          <Link to="/" className={`${styles.button} ${styles.homeButton}`}>
            <FaHome className={styles.buttonIcon} />
            <span>{t("notFound.goHome") || "Ana Səhifəyə Qayıt"}</span>
          </Link>
          <Link to="/shop" className={`${styles.button} ${styles.shopButton}`}>
            <FaShoppingBag className={styles.buttonIcon} />
            <span>{t("notFound.goShop") || "Mağazaya Keç"}</span>
          </Link>
        </div>

        {/* Interactive hint */}
        <div className={styles.interactionHint}>
          <span>Pişiyi sığalla! 🐾</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
