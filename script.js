document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeMap = {
        '1': 'theme-1',
        '2': 'theme-2',
        '3': 'theme-3',
        '4': 'theme-4',
        '5': 'theme-5'
    };

    const themeButtons = document.querySelectorAll('.theme-btn');

    const setTheme = (theme) => {
        body.setAttribute('data-theme', theme);
        
        // Update active class on buttons
        themeButtons.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`.theme-btn[data-set-theme="${theme}"]`);
        if (targetBtn) targetBtn.classList.add('active');

        const sphere = document.querySelector('.hero-sphere');
        if(sphere) {
            sphere.style.animation = 'none';
            sphere.offsetHeight; /* trigger reflow */
            sphere.style.animation = 'float 10s ease-in-out infinite';
        }
    };

    // Make buttons clickable
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-set-theme');
            setTheme(theme);
        });
    });

    // Keyboard Shortcuts (1-5 for Themes, Left/Right for Themes, Cmd+K for Search, Space for Play/Pause, Esc to Blur)
    document.addEventListener('keydown', (event) => {
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.isContentEditable;
        const pressed = event.key;
        
        // Handle Cmd+K / Ctrl+K to focus search input
        if ((event.metaKey || event.ctrlKey) && pressed.toLowerCase() === 'k') {
            event.preventDefault();
            const input = document.querySelector('.bottom-bar input');
            if(input) input.focus();
            return;
        }

        // Handle Escape to unfocus search input
        if (pressed === 'Escape') {
            const input = document.querySelector('.bottom-bar input');
            if (input && activeElement === input) {
                input.blur();
                return;
            }
        }

        if (isTyping) return;

        // Theme switching (1-5 keys)
        if (themeMap[pressed]) {
            event.preventDefault();
            setTheme(themeMap[pressed]);
            return;
        }

        // Theme switching (Arrow keys)
        if (pressed === 'ArrowLeft' || pressed === 'ArrowRight') {
            event.preventDefault();
            const currentTheme = body.getAttribute('data-theme') || 'theme-1';
            const currentIndex = Number(currentTheme.split('-')[1]);
            const direction = pressed === 'ArrowRight' ? 1 : -1;
            let nextIndex = currentIndex + direction;
            if (nextIndex < 1) nextIndex = 5;
            if (nextIndex > 5) nextIndex = 1;
            setTheme(`theme-${nextIndex}`);
            return;
        }

        // Spacebar to Play/Pause media
        if (pressed === ' ' || pressed === 'Spacebar') {
            event.preventDefault();
            const playBtn = document.querySelector('.play-btn');
            if(playBtn) playBtn.click();
        }
    });

    // Make Navigation Clickable
    const navItems = document.querySelectorAll('.navigation li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => {
                nav.classList.remove('active');
                const dot = nav.querySelector('.dot');
                if(dot) dot.remove();
            });
            item.classList.add('active');
            // Add the dot to the newly active item
            if(!item.querySelector('.dot')) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                item.appendChild(dot);
            }
        });
    });

    // Make play button interactive
    const playBtn = document.querySelector('.play-btn i');
    if(playBtn) {
        document.querySelector('.play-btn').addEventListener('click', () => {
            if(playBtn.classList.contains('ph-play')) {
                playBtn.classList.remove('ph-play');
                playBtn.classList.add('ph-pause');
            } else {
                playBtn.classList.remove('ph-pause');
                playBtn.classList.add('ph-play');
            }
        });
    }
});
