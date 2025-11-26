document.addEventListener('DOMContentLoaded', function() {
    // 1. Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Добавляем анимацию к элементам
    const animatedElements = document.querySelectorAll('.thought-card, .media-item, .gratitude-item, .promise-item');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // 2. Автовоспроизведение видео при появлении на экране
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                const playPromise = video.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log('Автовоспроизведение заблокировано');
                        video.addEventListener('click', function() {
                            this.play();
                        }, { once: true });
                    });
                }
            } else {
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, { threshold: 0.5 });

    // Наблюдаем за всеми видео в разделе моментов
    const videos = document.querySelectorAll('.moments-section video');
    videos.forEach(video => {
        video.setAttribute('preload', 'metadata');
        videoObserver.observe(video);
    });

    // 3. Полноэкранный режим для фото и видео
    const mediaItems = document.querySelectorAll('.media-item');
    
    mediaItems.forEach(item => {
        // Делаем все медиа-элементы кликабельными
        item.style.cursor = 'pointer';
        
        item.addEventListener('click', function(e) {
            const img = this.querySelector('img');
            const video = this.querySelector('video');
            
            if (img) {
                openFullscreen(img.src, 'image');
            } else if (video) {
                openFullscreen(video, 'video');
            }
        });
    });

    // Функция открытия полноэкранного режима
    function openFullscreen(element, type) {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.95)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        modal.style.cursor = 'pointer';
        
        // Создаем контент для полноэкранного режима
        let fullscreenContent;
        
        if (type === 'image') {
            fullscreenContent = document.createElement('img');
            fullscreenContent.src = element;
            fullscreenContent.style.maxWidth = '95%';
            fullscreenContent.style.maxHeight = '95%';
            fullscreenContent.style.objectFit = 'contain';
        } else {
            fullscreenContent = element.cloneNode(true);
            fullscreenContent.controls = true;
            fullscreenContent.autoplay = true;
            fullscreenContent.style.maxWidth = '95%';
            fullscreenContent.style.maxHeight = '95%';
        }
        
        // Кнопка закрытия
        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '40px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '1001';
        closeBtn.style.width = '50px';
        closeBtn.style.height = '50px';
        closeBtn.style.display = 'flex';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.alignItems = 'center';
        
        // Добавляем элементы в модальное окно
        modal.appendChild(fullscreenContent);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);
        
        // Функции закрытия
        function closeFullscreen() {
            document.body.removeChild(modal);
            // Восстанавливаем скролл
            document.body.style.overflow = 'auto';
        }
        
        closeBtn.addEventListener('click', closeFullscreen);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFullscreen();
            }
        });
        
        // Закрытие по ESC
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                closeFullscreen();
                document.removeEventListener('keydown', handleKeydown);
            }
        }
        document.addEventListener('keydown', handleKeydown);
        
        // Блокируем скролл основного контента
        document.body.style.overflow = 'hidden';
    }

    // 4. Плавный скролл для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Предотвращение масштабирования при дабл-тапе
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Добавить в DOMContentLoaded после автовоспроизведения видео
const mainVideo = document.querySelector('.main-video-section video');
if (mainVideo) {
    // Предзагружаем основное видео в фоне
    mainVideo.addEventListener('loadstart', function() {
        this.parentElement.classList.add('video-loading');
    });
    
    mainVideo.addEventListener('canplay', function() {
        this.parentElement.classList.remove('video-loading');
    });
}