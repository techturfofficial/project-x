document.addEventListener('DOMContentLoaded', () => {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const body = document.body;
    const themeMap = {
        '1': 'theme-1',
        '2': 'theme-2',
        '3': 'theme-3',
        '4': 'theme-4',
        '5': 'theme-5'
    };

    const setTheme = (theme) => {
        const targetButton = document.querySelector(`.theme-btn[data-set-theme="${theme}"]`);
        if (!targetButton) return;

        // Remove active class from all buttons
        themeButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        targetButton.classList.add('active');
        // Set theme on body
        body.setAttribute('data-theme', theme);
        // Briefly highlight borders on theme change
        highlightBorders();
        
        // Restart animation on sphere
        const sphere = document.querySelector('.hero-sphere');
        if (sphere) {
            sphere.style.animation = 'none';
            void sphere.offsetHeight; // Trigger reflow
            sphere.style.animation = 'float 10s ease-in-out infinite';
        }
        
        console.log('Theme switched to:', theme); // Debug
    };

    // Add a temporary border highlight to all glass panels
    const highlightBorders = () => {
        const panels = document.querySelectorAll('.glass-panel');
        if (!panels.length) return;
        panels.forEach(p => p.classList.add('border-highlight'));
        setTimeout(() => {
            panels.forEach(p => p.classList.remove('border-highlight'));
        }, 900);
    };

    // Attach click listeners to all theme buttons
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const theme = btn.getAttribute('data-set-theme');
            console.log('Button clicked:', theme); // Debug
            setTheme(theme);
        });
    });

    // Keyboard shortcuts for theme switching
    document.addEventListener('keydown', (event) => {
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.isContentEditable;
        if (isTyping) return;

        const pressed = event.key;
        if (themeMap[pressed]) {
            event.preventDefault();
            setTheme(themeMap[pressed]);
        }

        // Arrow key navigation between themes
        if (pressed === 'ArrowLeft' || pressed === 'ArrowRight') {
            event.preventDefault();
            const currentTheme = body.getAttribute('data-theme') || 'theme-1';
            const currentIndex = Number(currentTheme.split('-')[1]);
            const direction = pressed === 'ArrowRight' ? 1 : -1;
            let nextIndex = currentIndex + direction;
            if (nextIndex < 1) nextIndex = 5;
            if (nextIndex > 5) nextIndex = 1;
            setTheme(`theme-${nextIndex}`);
        }
    });

    // Navigation item interactions
    const navItems = document.querySelectorAll('.navigation li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Input focus effects
    const inputField = document.querySelector('.bottom-bar input');
    if (inputField) {
        inputField.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        inputField.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    }

    // Initial highlight on load
    highlightBorders();

    // 3D parallax effect (mouse/touch) — subtle movement on hero sphere, background glows, and panels
    (function enableParallax() {
        const container = document.querySelector('.app-container');
        const sphere = document.querySelector('.hero-sphere');
        const glows = document.querySelectorAll('.background-glow');
        const planes = document.querySelectorAll('.bg-plane');
        const panels = document.querySelectorAll('.glass-panel');
        if (!container) return;

        let mouseX = 0, mouseY = 0;
        let lx = 0, ly = 0;

        const strength = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--parallax-strength')) || 14;

        function onMove(e) {
            const rect = container.getBoundingClientRect();
            const cx = rect.left + rect.width/2;
            const cy = rect.top + rect.height/2;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            mouseX = (clientX - cx) / rect.width;
            mouseY = (clientY - cy) / rect.height;
        }

        function animate() {
            lx += (mouseX - lx) * 0.08;
            ly += (mouseY - ly) * 0.08;

            const tx = lx * strength;
            const ty = ly * strength;

            // hero sphere moves opposite for parallax
            if (sphere) sphere.style.transform = `translate3d(${ -tx }px, ${ -ty }px, ${ Math.abs(ly)*16 }px) rotateY(${ -lx*6 }deg)`;

            // update dynamic lighting CSS variables used by CSS for rim highlights and AO
            const lightX = 50 + lx * 18; // percent
            const lightY = 45 + ly * 18; // percent
            const lightIntensity = 0.28 + Math.min(0.7, (Math.abs(lx) + Math.abs(ly)) * 0.6);
            const ao = 0.36 - Math.min(0.2, Math.abs(ly) * 0.6);
            document.documentElement.style.setProperty('--light-x', `${lightX}%`);
            document.documentElement.style.setProperty('--light-y', `${lightY}%`);
            document.documentElement.style.setProperty('--light-intensity', `${lightIntensity}`);
            document.documentElement.style.setProperty('--ao-strength', `${ao}`);

            // background glows subtle movement
            glows.forEach((g, i) => {
                const mul = 1 + i*0.2;
                g.style.transform = `translate3d(${ -tx*mul/2 }px, ${ -ty*mul/2 }px, 0)`;
            });

            // 3D background planes movement with subtle Z parallax
            planes.forEach((pl, i) => {
                const mul = 1 + i * 0.6;
                const px = -tx * mul * 1.2;
                const py = -ty * mul * 1.1;
                const base = i===0 ? 'rotateY(-18deg) rotateX(8deg) translateZ(-80px)' : i===1 ? 'rotateY(12deg) rotateX(-6deg) translateZ(-40px)' : 'rotateY(-8deg) rotateX(10deg) translateZ(-120px)';
                const zJitter = (i-1) * 6; // small differential depth
                pl.style.transform = `translate3d(${px}px, ${py}px, ${zJitter}px) ${base}`;
                pl.style.opacity = 0.8 + (i*0.04);
            });

            // panels small tilt and elevation
            panels.forEach((p, idx) => {
                const depth = 6 + (idx % 4) * 6;
                const rx = ly * 4;
                const ry = -lx * 6;
                const txPanel = tx / (idx + 1);
                const tyPanel = ty / (idx + 1);
                p.style.transform = `translate3d(${ txPanel }px, ${ tyPanel }px, ${ depth }px) rotateX(${ rx }deg) rotateY(${ ry }deg)`;
                // dynamic box-shadow to simulate directional lighting
                const lightFactor = Math.max(0.12, 0.5 - Math.abs(lx) * 0.8 - Math.abs(ly) * 0.8);
                p.style.boxShadow = `0 ${12 + depth}px ${28 + depth*2}px rgba(6,12,20,${0.28 + (depth/120)}) , 0 0 ${24 + depth}px rgba(0,0,0,${0.06 * (1-lightFactor)})`;
            });

            requestAnimationFrame(animate);
        }

        container.addEventListener('mousemove', onMove, { passive: true });
        container.addEventListener('touchmove', onMove, { passive: true });
        requestAnimationFrame(animate);
    })();
});
