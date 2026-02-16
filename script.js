document.addEventListener("DOMContentLoaded", () => {
  const btnEntrer = document.querySelector(".btn-entrer");

  if (btnEntrer) {
    btnEntrer.addEventListener("click", (e) => {
      e.preventDefault();

      // Effet visuel
      document.body.classList.add("fade-out");

      // Effet sonore (optionnel si fichier audio ajouté)
      try {
        const audio = new Audio("sons/porte.mp3");
        audio.volume = 0.5; // Réduire le volume
        audio.play().catch(err => {
          // Si le son ne peut pas être joué, on continue quand même
          console.log("Audio non disponible:", err);
        });
      } catch (error) {
        console.log("Erreur audio:", error);
      }

      // Redirection après l'animation
      setTimeout(() => {
        window.location.href = btnEntrer.getAttribute("href");
      }, 1500); // Laisse le temps à l'effet
    });

    // Préchargement de la page suivante pour une transition plus rapide
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = btnEntrer.getAttribute("href");
    document.head.appendChild(link);
  }

  // Animation d'entrée pour le logo
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.style.opacity = "0";
    logo.style.transform = "translateY(20px)";

    setTimeout(() => {
      logo.style.transition = "opacity 1s ease, transform 1s ease";
      logo.style.opacity = "1";
      logo.style.transform = "translateY(0)";
    }, 100);
  }

  // Gestion du clavier pour l'accessibilité
  btnEntrer.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btnEntrer.click();
    }
  });
});